import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth, ensureUser } from "./middleware/auth.js";
import {
  apiLimiter,
  generationLimiter,
  uploadLimiter,
  webhookLimiter,
} from "./middleware/rateLimiter.js";
import { logger } from "./utils/logger.js";

// Route imports
import uploadRoutes from "./routes/upload.js";
import generationRoutes from "./routes/generation.js";
import galleryRoutes from "./routes/gallery.js";
import creditsRoutes from "./routes/credits.js";
import userRoutes from "./routes/user.js";
import usersRoutes from "./routes/users.js";
import notificationsRoutes from "./routes/notifications.js";
import stripeCheckoutRoutes, { stripeWebhookRouter } from "./routes/stripe.js";

const app = express();

// ─── Trust Proxy ────────────────────────────────────────────────────────────
// Required when behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
// so that req.ip returns the real client IP instead of the proxy's IP.
// Without this, all rate limiting would share a single bucket for all clients.
if (config.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

// ─── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(
  helmet({
    // Content Security Policy — restricts what resources can be loaded
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["https://js.stripe.com"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    // Force HTTPS with HSTS (1 year, include subdomains, allow preload)
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME type sniffing (enabled by default)
    // Referrer policy — don't leak full URL to external sites
    referrerPolicy: { policy: "same-origin" },
    // Prevent clickjacking
    frameguard: { action: "deny" },
  })
);

// ─── CORS Configuration ─────────────────────────────────────────────────────
// Strict origin validation — only allow explicitly trusted origins.
// This prevents malicious websites from making authenticated requests
// to our API on behalf of logged-in users (CSRF-style attacks via CORS).
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn("CORS: Rejected request from untrusted origin", { origin });
      callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    }
  },
  credentials: true, // Allow cookies / Authorization headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: [
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
    "Retry-After",
  ],
  maxAge: 86400, // Cache preflight responses for 24 hours
};
app.use(cors(corsOptions));

// ─── Stripe Webhook (MUST be before JSON body parsing — needs raw body) ────
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookRouter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" })); // Reduced from 50mb — JSON payloads should be small
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Clerk Auth Middleware (global — parses auth tokens) ────────────────────
app.use(clerkMiddleware());

// ─── Global Rate Limiting ───────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Health Check (unauthenticated) ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use(
  "/api/upload",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  uploadLimiter,
  uploadRoutes
);
app.use(
  "/api/generate",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  generationLimiter,
  generationRoutes
);
app.use(
  "/api/gallery",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  galleryRoutes
);
app.use(
  "/api/credits",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  creditsRoutes
);
// User routes — /sync is webhook (verified inside route), others use requireAuth internally
app.use("/api/user", webhookLimiter, userRoutes);
app.use(
  "/api/users",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  usersRoutes
);
app.use(
  "/api/notifications",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  notificationsRoutes
);
app.use(
  "/api/stripe",
  requireAuth as express.RequestHandler,
  ensureUser as express.RequestHandler,
  stripeCheckoutRoutes
);

// ─── Error Handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(`VidCraft API running on port ${config.PORT}`);
});

export default app;
