import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  KIE_API_KEY: z.string().min(1),
  KIE_API_BASE_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_BASIC_PRICE_ID: z.string().min(1),
  STRIPE_PRO_PRICE_ID: z.string().min(1),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  RESEND_API_KEY: z.string().optional(),

  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),

  // Clerk Webhook Verification
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Rate Limiting (configurable per environment)
  RATE_LIMIT_API_MAX: z.string().default("100"),
  RATE_LIMIT_API_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_GENERATION_MAX: z.string().default("5"),
  RATE_LIMIT_GENERATION_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_UPLOAD_MAX: z.string().default("10"),
  RATE_LIMIT_UPLOAD_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_WEBHOOK_MAX: z.string().default("30"),
  RATE_LIMIT_WEBHOOK_WINDOW_MS: z.string().default("60000"),

  // Trust proxy (set to "true" if behind a reverse proxy like nginx/cloudflare)
  TRUST_PROXY: z.string().default("false"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
  ALLOWED_ORIGINS: parsed.data.ALLOWED_ORIGINS.split(",").map((s) => s.trim()),
  TRUST_PROXY: parsed.data.TRUST_PROXY === "true",

  // Parsed rate limits
  rateLimits: {
    api: {
      max: parseInt(parsed.data.RATE_LIMIT_API_MAX, 10),
      windowMs: parseInt(parsed.data.RATE_LIMIT_API_WINDOW_MS, 10),
    },
    generation: {
      max: parseInt(parsed.data.RATE_LIMIT_GENERATION_MAX, 10),
      windowMs: parseInt(parsed.data.RATE_LIMIT_GENERATION_WINDOW_MS, 10),
    },
    upload: {
      max: parseInt(parsed.data.RATE_LIMIT_UPLOAD_MAX, 10),
      windowMs: parseInt(parsed.data.RATE_LIMIT_UPLOAD_WINDOW_MS, 10),
    },
    webhook: {
      max: parseInt(parsed.data.RATE_LIMIT_WEBHOOK_MAX, 10),
      windowMs: parseInt(parsed.data.RATE_LIMIT_WEBHOOK_WINDOW_MS, 10),
    },
  },
};
