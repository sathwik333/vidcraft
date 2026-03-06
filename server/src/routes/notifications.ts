import { Router } from "express";
import { supabase } from "../config/supabase.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 50);
    const offset = (page - 1) * limit;

    const { data: notifications, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", authReq.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    res.json({
      notifications: notifications || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", authReq.userId);

    if (error) {
      res.status(500).json({ error: "Failed to mark as read" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", authReq.userId)
      .eq("read", false);

    if (error) {
      res.status(500).json({ error: "Failed to mark all as read" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", authReq.userId);

    if (error) {
      res.status(500).json({ error: "Failed to delete notification" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", authReq.userId);

    if (error) {
      res.status(500).json({ error: "Failed to clear notifications" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
