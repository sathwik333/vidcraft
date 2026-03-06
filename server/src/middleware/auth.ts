import type { Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import type { AuthenticatedRequest } from "../types/index.js";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware that requires a valid Clerk session.
 * Extracts userId from the Clerk token and attaches it to req.userId.
 * Returns 401 if no authenticated user is found.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    req.userId = auth.userId;
    next();
  } catch (error) {
    logger.error("Auth middleware error", { error });
    res.status(401).json({
      error: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Middleware that ensures the authenticated user has a record in Supabase.
 * Auto-creates one from Clerk data if missing. Run after requireAuth.
 */
export async function ensureUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;

    // Check if user exists
    const { data } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("clerk_id", userId)
      .single();

    if (data) {
      next();
      return;
    }

    // User doesn't exist — fetch from Clerk and create
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: userId,
        email,
        display_name: displayName,
        avatar_url: clerkUser.imageUrl || null,
        credits: 1,
        tier: "free",
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      logger.error("Failed to auto-create user", {
        userId,
        error: error.message,
      });
      res.status(500).json({ error: "Failed to initialize user account" });
      return;
    }

    logger.info("Auto-created user in Supabase", { userId, email });
    next();
  } catch (error) {
    logger.error("ensureUser middleware error", { error });
    next();
  }
}
