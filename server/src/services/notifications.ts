import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

interface CreateNotificationParams {
  userId: string; // clerk_id
  title: string;
  message: string;
  type: "generation_complete" | "generation_failed" | "credits" | "system";
  metadata?: Record<string, unknown>;
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    metadata: params.metadata || null,
  });

  if (error) {
    logger.error("Failed to create notification", {
      userId: params.userId,
      type: params.type,
      error: error.message,
    });
    return;
  }

  logger.info("Notification created", {
    userId: params.userId,
    type: params.type,
  });
}

export async function createGenerationCompleteNotification(
  userId: string,
  generationId: string,
  model: string
): Promise<void> {
  await createNotification({
    userId,
    title: "Video Ready",
    message: `Your ${model} video has been generated successfully and is ready to view.`,
    type: "generation_complete",
    metadata: { generationId, model },
  });
}

export async function createGenerationFailedNotification(
  userId: string,
  generationId: string,
  model: string,
  reason: string
): Promise<void> {
  await createNotification({
    userId,
    title: "Generation Failed",
    message: `Your ${model} video generation failed: ${reason}`,
    type: "generation_failed",
    metadata: { generationId, model, reason },
  });
}
