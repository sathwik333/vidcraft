import Stripe from "stripe";
import { config } from "./env.js";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Plan → Price ID + credits mapping
export const PLAN_CONFIG: Record<string, { priceId: string; credits: number; tier: string }> = {
  basic: {
    priceId: config.STRIPE_BASIC_PRICE_ID,
    credits: 10,
    tier: "basic",
  },
  pro: {
    priceId: config.STRIPE_PRO_PRICE_ID,
    credits: 30,
    tier: "pro",
  },
};
