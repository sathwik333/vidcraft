import { Router } from "express";
import { getUserCredits } from "../services/credits.js";
import { supabase } from "../config/supabase.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { credits, tier } = await getUserCredits(authReq.userId);
    res.json({ credits, tier });
  } catch (err) {
    next(err);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 50);
    const offset = (page - 1) * limit;

    // credit_transactions.user_id stores the clerk_id (not the internal UUID)
    const { data: transactions, count } = await supabase
      .from("credit_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", authReq.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    res.json({ transactions: transactions || [], total: count || 0, page, limit });
  } catch (err) {
    next(err);
  }
});

export default router;
