import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { Request } from "express";

/**
 * Key generator that uses the authenticated user's ID when available,
 * falling back to IP address. This prevents a single authenticated user
 * from exhausting the limit for all users behind the same IP (e.g. office NAT),
 * while still protecting unauthenticated endpoints by IP.
 */
function userAwareKeyGenerator(req: Request): string {
  try {
    const auth = getAuth(req);
    if (auth?.userId) return `user:${auth.userId}`;
  } catch {
    // Clerk middleware may not have run yet — fall back to IP
  }
  return `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
}

function ipOnlyKeyGenerator(req: Request): string {
  return `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
}

/**
 * Global API rate limiter — applied to all /api routes.
 * Default: 100 requests per minute per user/IP.
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimits.api.windowMs,
  max: config.rateLimits.api.max,
  standardHeaders: true, // Returns RateLimit-* headers (including Retry-After)
  legacyHeaders: false,
  keyGenerator: userAwareKeyGenerator,
  handler: (_req, res) => {
    logger.warn("API rate limit exceeded", {
      key: userAwareKeyGenerator(_req),
      path: _req.path,
    });
    res.status(429).json({
      error: "Too many requests, please try again later",
      code: "RATE_LIMITED",
    });
  },
});

/**
 * Stricter limiter for generation endpoint — this costs real money.
 * Default: 5 requests per minute per user/IP.
 */
export const generationLimiter = rateLimit({
  windowMs: config.rateLimits.generation.windowMs,
  max: config.rateLimits.generation.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userAwareKeyGenerator,
  handler: (_req, res) => {
    logger.warn("Generation rate limit exceeded", {
      key: userAwareKeyGenerator(_req),
    });
    res.status(429).json({
      error: "Too many generation requests, please slow down",
      code: "GENERATION_RATE_LIMITED",
    });
  },
});

/**
 * Upload limiter — prevents storage abuse.
 * Default: 10 uploads per minute per user/IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: config.rateLimits.upload.windowMs,
  max: config.rateLimits.upload.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userAwareKeyGenerator,
  handler: (_req, res) => {
    logger.warn("Upload rate limit exceeded", {
      key: userAwareKeyGenerator(_req),
    });
    res.status(429).json({
      error: "Too many upload requests, please slow down",
      code: "UPLOAD_RATE_LIMITED",
    });
  },
});

/**
 * Webhook limiter — prevents denial-of-service on the webhook endpoint.
 * Keyed by IP only since webhooks have no user context.
 * Default: 30 requests per minute per IP.
 */
export const webhookLimiter = rateLimit({
  windowMs: config.rateLimits.webhook.windowMs,
  max: config.rateLimits.webhook.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipOnlyKeyGenerator,
  handler: (_req, res) => {
    logger.warn("Webhook rate limit exceeded", { ip: _req.ip });
    res.status(429).json({
      error: "Too many requests",
      code: "WEBHOOK_RATE_LIMITED",
    });
  },
});
