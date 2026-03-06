import { Router, type RequestHandler } from "express";
import { Webhook } from "svix";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { requireAuth } from "../middleware/auth.js";
import { MODEL_CONFIG } from "../utils/modelConfig.js";
import { config } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/index.js";

const auth = requireAuth as RequestHandler;

const router = Router();

/**
 * Clerk webhook — create user on signup.
 * 
 * SECURITY: This endpoint verifies the Svix signature to ensure the request
 * genuinely came from Clerk. Without this, an attacker could forge
 * `user.created` events to create accounts with arbitrary data, manipulate
 * credits, or inject malicious payloads into the database.
 */
router.post("/sync", async (req, res, next) => {
  try {
    // ── Webhook Signature Verification ──────────────────────────────────
    const webhookSecret = config.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("CLERK_WEBHOOK_SECRET is not configured — rejecting webhook");
      res.status(403).json({ error: "Forbidden", code: "WEBHOOK_FORBIDDEN" });
      return;
    }

    const svixId = req.headers["svix-id"] as string | undefined;
    const svixTimestamp = req.headers["svix-timestamp"] as string | undefined;
    const svixSignature = req.headers["svix-signature"] as string | undefined;

    if (!svixId || !svixTimestamp || !svixSignature) {
      logger.warn("Webhook request missing Svix headers", {
        ip: req.ip,
        hasSvixId: !!svixId,
        hasSvixTimestamp: !!svixTimestamp,
        hasSvixSignature: !!svixSignature,
      });
      res.status(400).json({ error: "Missing webhook verification headers" });
      return;
    }

    // Verify the payload signature
    const wh = new Webhook(webhookSecret);
    let verifiedPayload: Record<string, any>;

    try {
      verifiedPayload = wh.verify(JSON.stringify(req.body), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as Record<string, any>;
    } catch (err) {
      logger.warn("Webhook signature verification failed", {
        ip: req.ip,
        error: err instanceof Error ? err.message : "Unknown",
      });
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    // ── Process Verified Event ──────────────────────────────────────────
    const { type, data } = verifiedPayload;

    if (type === "user.created") {
      const clerkId = data?.id;
      if (!clerkId || typeof clerkId !== "string") {
        logger.warn("Webhook user.created event missing valid id", { data });
        res.status(400).json({ error: "Invalid event data" });
        return;
      }

      const email = data.email_addresses?.[0]?.email_address || "";
      const displayName = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ") || null;

      // Insert only — do NOT upsert. If the user already exists (e.g. webhook
      // replay), leave their credits and tier untouched.
      const { error } = await supabase.from("users").insert({
        clerk_id: clerkId,
        email,
        display_name: displayName,
        avatar_url: data.image_url || null,
        credits: 1, // 1 free video on signup
        tier: "free",
      });

      // Unique violation (23505) means the user already exists — safe to ignore
      if (error && error.code !== "23505") {
        logger.error("Failed to sync user", { error: error.message, clerkId });
        res.status(500).json({ error: "Failed to sync user" });
        return;
      }

      // Mask email in logs for privacy
      const maskedEmail = email
        ? email.replace(
            /^(.{1,2})(.*)(@.*)$/,
            (_match: string, a: string, b: string, c: string) =>
              a + "*".repeat(b.length) + c
          )
        : "";
      logger.info("User synced via verified webhook", { clerkId, email: maskedEmail });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// Get profile (auth required)
router.get("/profile", auth, async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", authReq.userId)
      .single();

    if (error || !user) {
      res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
      return;
    }

    // Get total generations count (generations use clerk_id as user_id)
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authReq.userId);

    res.json({ ...user, total_generations: count || 0 });
  } catch (err) {
    next(err);
  }
});

// Dashboard stats (auth required)
router.get("/dashboard-stats", auth, async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const userId = authReq.userId;

    // Total videos successfully generated (exclude failed/pending)
    const { count: totalGenerations } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    // Credits used this month (deductions minus refunds)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyTx } = await supabase
      .from("credit_transactions")
      .select("amount, type")
      .eq("user_id", userId)
      .in("type", ["deduction", "refund"])
      .gte("created_at", startOfMonth.toISOString());

    const creditsUsedThisMonth = (monthlyTx || []).reduce(
      (sum: number, tx: { amount: number; type: string }) => {
        if (tx.type === "deduction") return sum + Math.abs(tx.amount);
        if (tx.type === "refund") return sum - Math.abs(tx.amount);
        return sum;
      },
      0
    );

    // Favorite model (only from completed generations)
    const { data: modelRows } = await supabase
      .from("generations")
      .select("model")
      .eq("user_id", userId)
      .eq("status", "completed");

    let favoriteModel: string | null = null;
    if (modelRows && modelRows.length > 0) {
      const counts: Record<string, number> = {};
      for (const g of modelRows) {
        counts[g.model] = (counts[g.model] || 0) + 1;
      }
      const topModelId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0];
      favoriteModel = MODEL_CONFIG[topModelId]?.displayName ?? topModelId;
    }

    // Recent 5 generations
    const { data: recentGenerations } = await supabase
      .from("generations")
      .select("id, model, style, status, created_at, thumbnail_url")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    res.json({
      totalGenerations: totalGenerations || 0,
      creditsUsedThisMonth,
      favoriteModel,
      recentGenerations: recentGenerations || [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
