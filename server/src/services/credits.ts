import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import type { DbCreditTransaction, DbUser } from "../types/database.js";

// ─── Get User Credits ───────────────────────────────────────────────────────

export async function getUserCredits(
  userId: string
): Promise<{ credits: number; tier: string }> {
  const { data, error } = await supabase
    .from("users")
    .select("credits, tier")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    logger.error("Failed to get user credits", { userId, error: error.message });
    throw Object.assign(new Error("Failed to retrieve credit balance"), {
      statusCode: 500,
      code: "CREDITS_FETCH_ERROR",
    });
  }

  const user = data as Pick<DbUser, "credits" | "tier">;
  return { credits: user.credits, tier: user.tier };
}

// ─── Check if User Has Enough Credits ───────────────────────────────────────

export async function hasEnoughCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const { credits } = await getUserCredits(userId);
  return credits >= amount;
}

// ─── Deduct Credits (Atomic with Optimistic Locking) ────────────────────────

export async function deductCredits(
  userId: string,
  amount: number,
  generationId: string
): Promise<{ balanceAfter: number }> {
  // Optimistic locking: read current balance, then update only if unchanged.
  // The WHERE credits = currentCredits guard prevents double-spend from
  // concurrent requests. Retries once on conflict.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { credits: currentCredits } = await getUserCredits(userId);

    if (currentCredits < amount) {
      throw Object.assign(new Error("Insufficient credits"), {
        statusCode: 402,
        code: "INSUFFICIENT_CREDITS",
      });
    }

    const balanceAfter = currentCredits - amount;

    // Atomic update: only succeeds if credits haven't changed since read
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ credits: balanceAfter, updated_at: new Date().toISOString() })
      .eq("clerk_id", userId)
      .eq("credits", currentCredits)
      .select("credits")
      .single();

    if (updateError || !updated) {
      if (attempt === 0) {
        logger.warn("Credit deduction conflict, retrying", { userId, amount });
        continue;
      }
      logger.error("Failed to deduct credits after retry", { userId, amount });
      throw Object.assign(new Error("Failed to deduct credits"), {
        statusCode: 500,
        code: "CREDITS_DEDUCT_ERROR",
      });
    }

    // Create transaction record (non-fatal if it fails)
    const { error: txError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: -amount,
        balance_after: balanceAfter,
        type: "deduction",
        description: `Video generation`,
        generation_id: generationId,
      });

    if (txError) {
      logger.error("Failed to create credit transaction", {
        userId,
        error: txError.message,
      });
    }

    logger.info("Credits deducted", {
      userId,
      amount,
      balanceAfter,
      generationId,
    });

    return { balanceAfter };
  }

  // TypeScript: unreachable, but satisfies return type
  throw Object.assign(new Error("Failed to deduct credits"), {
    statusCode: 500,
    code: "CREDITS_DEDUCT_ERROR",
  });
}

// ─── Check for Existing Refund (by generation ID) ───────────────────────────

export async function hasExistingRefund(generationId: string): Promise<boolean> {
  const { data } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("generation_id", generationId)
    .eq("type", "refund")
    .maybeSingle();
  return !!data;
}

// ─── Add Credits (Atomic with Optimistic Locking) ───────────────────────────

export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  type: "purchase" | "bonus" | "refund" = "bonus",
  generationId?: string | null
): Promise<{ balanceAfter: number }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { credits: currentCredits } = await getUserCredits(userId);
    const balanceAfter = currentCredits + amount;

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ credits: balanceAfter, updated_at: new Date().toISOString() })
      .eq("clerk_id", userId)
      .eq("credits", currentCredits)
      .select("credits")
      .single();

    if (updateError || !updated) {
      if (attempt === 0) {
        logger.warn("Credit addition conflict, retrying", { userId, amount });
        continue;
      }
      logger.error("Failed to add credits after retry", { userId, amount });
      throw Object.assign(new Error("Failed to add credits"), {
        statusCode: 500,
        code: "CREDITS_ADD_ERROR",
      });
    }

    const { error: txError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount,
        balance_after: balanceAfter,
        type,
        description: reason,
        generation_id: generationId ?? null,
      });

    if (txError) {
      logger.error("Failed to create credit transaction", {
        userId,
        error: txError.message,
      });
    }

    logger.info("Credits added", { userId, amount, balanceAfter, reason });

    return { balanceAfter };
  }

  throw Object.assign(new Error("Failed to add credits"), {
    statusCode: 500,
    code: "CREDITS_ADD_ERROR",
  });
}

// ─── Get Credit Transactions ────────────────────────────────────────────────

export async function getCreditTransactions(
  userId: string,
  page: number,
  limit: number
): Promise<{ transactions: DbCreditTransaction[]; total: number }> {
  const offset = (page - 1) * limit;

  // Get total count
  const { count, error: countError } = await supabase
    .from("credit_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    logger.error("Failed to count credit transactions", {
      userId,
      error: countError.message,
    });
    throw Object.assign(new Error("Failed to fetch transactions"), {
      statusCode: 500,
      code: "TRANSACTIONS_FETCH_ERROR",
    });
  }

  // Get paginated data
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error("Failed to fetch credit transactions", {
      userId,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to fetch transactions"), {
      statusCode: 500,
      code: "TRANSACTIONS_FETCH_ERROR",
    });
  }

  return {
    transactions: (data ?? []) as DbCreditTransaction[],
    total: count ?? 0,
  };
}
