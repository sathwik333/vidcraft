import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

const preferencesSchema = z.object({
    inAppNotifications: z.boolean(),
    emailNotifications: z.boolean(),
    generationCompleteEmail: z.boolean(),
    marketingEmails: z.boolean(),
}).partial();

// Get current user's preferences
router.get("/preferences", async (req, res, next) => {
    try {
        const authReq = req as AuthenticatedRequest;

        const { data: user, error } = await supabase
            .from("users")
            .select("preferences")
            .eq("clerk_id", authReq.userId)
            .single();

        if (error) throw error;
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.preferences);
    } catch (err) {
        logger.error("Error fetching user preferences:", err);
        next(err);
    }
});

// Update user's preferences
router.put("/preferences", async (req, res, next) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const parsed = preferencesSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid preferences",
                code: "VALIDATION_ERROR",
                details: parsed.error.flatten().fieldErrors,
            });
        }
        const updates = parsed.data;

        // Get existing preferences first
        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("preferences")
            .eq("clerk_id", authReq.userId)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newPreferences = {
            ...user.preferences,
            ...updates
        };

        const { error: updateError } = await supabase
            .from("users")
            .update({ preferences: newPreferences })
            .eq("clerk_id", authReq.userId);

        if (updateError) throw updateError;

        res.json(newPreferences);
    } catch (err) {
        logger.error("Error updating user preferences:", err);
        next(err);
    }
});

export default router;
