import { Router } from "express";
import {
  getGenerationsByUser,
  getGenerationById,
  deleteGeneration,
} from "../services/generation.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 50);
    const model = req.query.model as string | undefined;
    const style = req.query.style as string | undefined;
    const status = req.query.status as string | undefined;

    const filter: { model?: string; style?: string; status?: string } = {};
    if (model) filter.model = model;
    if (style) filter.style = style;
    if (status) filter.status = status;

    const { generations, total } = await getGenerationsByUser(
      authReq.userId,
      page,
      limit,
      filter
    );

    res.json({ generations, total, page, limit });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const generation = await getGenerationById(req.params.id);

    if (!generation || generation.user_id !== authReq.userId) {
      res.status(404).json({ error: "Generation not found", code: "NOT_FOUND" });
      return;
    }

    res.json(generation);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const generation = await getGenerationById(req.params.id);

    if (!generation || generation.user_id !== authReq.userId) {
      res.status(404).json({ error: "Generation not found", code: "NOT_FOUND" });
      return;
    }

    await deleteGeneration(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
