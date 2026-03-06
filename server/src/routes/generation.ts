import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validateRequest.js";
import { submitGeneration, getTaskStatus } from "../services/kieai.js";
import { hasEnoughCredits, deductCredits, addCredits, hasExistingRefund } from "../services/credits.js";
import {
  createGeneration,
  getGenerationById,
  getActiveGeneration,
  updateGenerationStatus,
} from "../services/generation.js";
import { getCreditCost, MODEL_CONFIG } from "../utils/modelConfig.js";
import {
  createGenerationCompleteNotification,
  createGenerationFailedNotification,
} from "../services/notifications.js";
import { sendGenerationCompleteEmail } from "../services/email.js";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

const generateSchema = z.object({
  model: z.string().refine((m) => m in MODEL_CONFIG, "Invalid model"),
  style: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  duration: z.number().int().positive(),
  aspectRatio: z.string().min(1),
  imageUrl: z.string().url(),
});

router.post("/", validateBody(generateSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { model, style, prompt, duration, aspectRatio, imageUrl } = req.body;

    // Validate duration is supported by model
    const modelConfig = MODEL_CONFIG[model];
    if (!modelConfig || !modelConfig.durations.includes(duration)) {
      res.status(400).json({
        error: `Duration ${duration}s is not supported by ${modelConfig?.displayName || model}`,
        code: "INVALID_DURATION",
      });
      return;
    }

    // Check credits
    const creditCost = getCreditCost(model, duration);
    const canAfford = await hasEnoughCredits(authReq.userId, creditCost);
    if (!canAfford) {
      res.status(402).json({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: creditCost,
      });
      return;
    }

    // Submit to Kie.ai first (before deducting credits)
    const { taskId } = await submitGeneration({
      model,
      imageUrl,
      prompt,
      duration,
      aspectRatio,
      style,
    });

    // Kie.ai accepted — now create record and deduct credits
    const generation = await createGeneration({
      user_id: authReq.userId,
      model: model as "veo-3.1" | "runway-gen4-turbo" | "kling-2.1" | "sora-2",
      style,
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      image_url: imageUrl,
      status: "processing",
      task_id: taskId,
      credit_cost: creditCost,
    });

    try {
      await deductCredits(authReq.userId, creditCost, generation.id);
    } catch (err) {
      // Deduction failed after the Kie.ai task was already submitted.
      // Mark the generation failed so the user isn't charged and the
      // task doesn't appear as a free pending job.
      await updateGenerationStatus(generation.id, "failed", {
        errorMessage: "Payment processing failed — please try again.",
      }).catch(() => {}); // best-effort; don't mask the original error
      throw err;
    }

    logger.info("Generation started", {
      userId: authReq.userId,
      generationId: generation.id,
      model,
      taskId,
    });

    res.json({ id: generation.id, taskId });
  } catch (err) {
    next(err);
  }
});

// Get the user's most recent active (processing/pending) generation
router.get("/active", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const generation = await getActiveGeneration(authReq.userId);

    if (!generation) {
      res.json({ active: false });
      return;
    }

    res.json({
      active: true,
      id: generation.id,
      taskId: generation.task_id,
      model: generation.model,
      style: generation.style,
      prompt: generation.prompt,
      duration: generation.duration,
      aspectRatio: generation.aspect_ratio,
      imageUrl: generation.image_url,
      status: generation.status,
      progress: generation.progress,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/status", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const { id } = req.params;

    const generation = await getGenerationById(id);
    if (!generation || generation.user_id !== authReq.userId) {
      res.status(404).json({ error: "Generation not found", code: "NOT_FOUND" });
      return;
    }

    // If already completed or failed, return stored status
    if (generation.status === "completed" || generation.status === "failed") {
      // If failed, ensure credits are refunded (handles timeout and any other
      // path that marks a generation failed without going through the refund below)
      if (generation.status === "failed" && generation.credit_cost > 0) {
        (async () => {
          try {
            const alreadyRefunded = await hasExistingRefund(generation.id);
            if (!alreadyRefunded) {
              await addCredits(
                authReq.userId,
                generation.credit_cost,
                "Refund for failed generation",
                "refund",
                generation.id
              );
              logger.info("Issued deferred refund for failed generation", {
                generationId: generation.id,
                userId: authReq.userId,
              });
            }
          } catch (err: any) {
            logger.error("Failed to issue deferred refund", {
              generationId: generation.id,
              error: err,
            });
          }
        })();
      }
      res.json({
        status: generation.status,
        progress: generation.status === "completed" ? 100 : 0,
        videoUrl: generation.video_url,
        error: generation.error_message,
      });
      return;
    }

    // Poll Kie.ai
    if (!generation.task_id) {
      res.json({ status: "pending", progress: 0 });
      return;
    }

    const taskStatus = await getTaskStatus(generation.task_id, generation.model);

    // Treat "completed with no video URL" as a failure — don't leave it stuck in processing
    if (taskStatus.status === "completed" && !taskStatus.videoUrl) {
      taskStatus.status = "failed";
      taskStatus.errorMessage = "Video generation completed but no video was returned. Please try again.";
    }

    if (taskStatus.status === "completed" && taskStatus.videoUrl) {
      await updateGenerationStatus(generation.id, "completed", {
        videoUrl: taskStatus.videoUrl,
        thumbnailUrl: taskStatus.thumbnailUrl || undefined,
        progress: 100,
      });
      createGenerationCompleteNotification(
        authReq.userId,
        generation.id,
        generation.model
      ).catch(() => { }); // fire-and-forget

      // Check user preferences for email notification
      try {
        const { data: user } = await supabase
          .from("users")
          .select("email, preferences")
          .eq("clerk_id", authReq.userId)
          .single();

        if (user?.preferences?.generationCompleteEmail) {
          sendGenerationCompleteEmail(user.email, taskStatus.videoUrl!, generation.model);
        }
      } catch (err: any) {
        logger.error("Failed to check user preferences for email", { error: err });
      }
    } else if (taskStatus.status === "failed") {
      const reason = taskStatus.errorMessage || "Generation failed";
      await updateGenerationStatus(generation.id, "failed", {
        errorMessage: reason,
      });
      // Refund credits on failure (idempotent — checked by generation_id)
      (async () => {
        try {
          const alreadyRefunded = await hasExistingRefund(generation.id);
          if (!alreadyRefunded) {
            await addCredits(
              authReq.userId,
              generation.credit_cost,
              "Refund for failed generation",
              "refund",
              generation.id
            );
          }
        } catch (err: any) {
          logger.error("Failed to refund credits", { generationId: generation.id, error: err });
        }
      })();
      createGenerationFailedNotification(
        authReq.userId,
        generation.id,
        generation.model,
        reason
      ).catch(() => { }); // fire-and-forget
    } else if (taskStatus.progress !== undefined) {
      await updateGenerationStatus(generation.id, generation.status, {
        progress: taskStatus.progress,
      });
    }

    res.json({
      status: taskStatus.status,
      progress: taskStatus.progress || 0,
      videoUrl: taskStatus.videoUrl,
      error: taskStatus.errorMessage,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
