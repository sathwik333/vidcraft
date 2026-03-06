import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { config } from "../config/env.js";

/**
 * Global error handler.
 *
 * SECURITY: In production, we NEVER expose internal error messages or stack
 * traces to the client. Attackers can use stack traces to identify framework
 * versions, file paths, and internal architecture, making targeted exploits
 * significantly easier.
 *
 * All errors are logged server-side for debugging, but the client only
 * receives a generic message for 500-level errors.
 */
export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  // Always log the full error server-side
  logger.error(err.message, {
    statusCode,
    code,
    stack: err.stack,
    path: _req.path,
    method: _req.method,
  });

  // In production, never expose internal details for 500 errors
  const isProduction = config.NODE_ENV === "production";
  const message =
    statusCode >= 500 && isProduction ? "Internal server error" : err.message;

  res.status(statusCode).json({
    error: message,
    code,
    // Only include stack trace in development for debugging
    ...(statusCode >= 500 && !isProduction && { stack: err.stack }),
  });
}
