import { Router } from "express";
import { z } from "zod";
import { stripe, PLAN_CONFIG } from "../config/stripe.js";
import { config } from "../config/env.js";
import { addCredits } from "../services/credits.js";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { validateBody } from "../middleware/validateRequest.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

// ─── Create Checkout Session (authenticated) ────────────────────────────────

const checkoutSchema = z.object({
  plan: z.enum(["basic", "pro"]),
});

router.post("/checkout", validateBody(checkoutSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { plan } = req.body;

    const planConfig = PLAN_CONFIG[plan];
    if (!planConfig) {
      res.status(400).json({ error: "Invalid plan", code: "INVALID_PLAN" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      client_reference_id: authReq.userId,
      metadata: {
        plan,
        credits: String(planConfig.credits),
        userId: authReq.userId,
      },
      success_url: `${config.CLIENT_URL}/payments?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${config.CLIENT_URL}/pricing?status=cancelled`,
    });

    logger.info("Stripe checkout session created", {
      userId: authReq.userId,
      plan,
      sessionId: session.id,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

export default router;

// ─── Stripe Webhook (separate export — needs raw body) ──────────────────────

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;

  if (!sig) {
    logger.warn("Stripe webhook missing signature header");
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body Buffer
      sig,
      config.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.warn("Stripe webhook signature verification failed", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;
    const plan = session.metadata?.plan;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (!userId || !credits) {
      logger.error("Stripe webhook missing metadata", {
        sessionId: session.id,
        userId,
        plan,
        credits,
      });
      res.status(200).json({ received: true }); // Acknowledge to prevent retries
      return;
    }

    try {
      // Idempotency guard: check if this session was already processed.
      // Session ID is embedded in the description of purchase transactions.
      const { data: existing } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "purchase")
        .eq("description", `${plan} credit pack purchase - ${session.id}`)
        .maybeSingle();

      if (existing) {
        logger.warn("Stripe webhook: session already processed, skipping", {
          sessionId: session.id,
          userId,
        });
        res.status(200).json({ received: true });
        return;
      }

      // Add credits (description includes session.id for idempotency tracking)
      await addCredits(userId, credits, `${plan} credit pack purchase - ${session.id}`, "purchase");

      // Always update tier to match the purchased plan
      if (plan) {
        const { error: tierError } = await supabase
          .from("users")
          .update({ tier: plan, updated_at: new Date().toISOString() })
          .eq("clerk_id", userId);

        if (tierError) {
          logger.error("Failed to update user tier", {
            userId,
            plan,
            error: tierError.message,
          });
        }
      }

      logger.info("Stripe payment processed", {
        userId,
        plan,
        credits,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
    } catch (err) {
      logger.error("Failed to process Stripe webhook", {
        sessionId: session.id,
        error: err instanceof Error ? err.message : "Unknown",
      });
      // Return 500 so Stripe retries
      res.status(500).json({ error: "Failed to process payment" });
      return;
    }
  }

  res.status(200).json({ received: true });
});
