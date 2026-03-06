import type { GenerationStatus, Tier, ModelId, StyleId, AspectRatio } from "./index.js";

export interface UserPreferences {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  generationCompleteEmail: boolean;
  marketingEmails: boolean;
}

// ─── Users Table ────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;                        // UUID (PK)
  clerk_id: string;                  // Clerk user ID (unique)
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: Tier;
  credits: number;
  preferences: UserPreferences;
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
}

// ─── Generations Table ──────────────────────────────────────────────────────

export interface DbGeneration {
  id: string;                        // UUID (PK)
  user_id: string;                   // FK -> users.clerk_id
  model: ModelId;
  style: StyleId;
  prompt: string;
  duration: number;
  aspect_ratio: AspectRatio;
  image_url: string;                 // Source photo URL
  video_url: string | null;          // Output video URL
  thumbnail_url: string | null;
  status: GenerationStatus;
  progress: number;                  // 0-100
  task_id: string | null;            // Kie.ai task ID
  credit_cost: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Notifications Table ────────────────────────────────────────────────────

export interface DbNotification {
  id: string;                        // UUID (PK)
  user_id: string;                   // FK -> users.clerk_id
  title: string;
  message: string;
  type: "generation_complete" | "generation_failed" | "credits" | "system";
  read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Credit Transactions Table ──────────────────────────────────────────────

export interface DbCreditTransaction {
  id: string;                        // UUID (PK)
  user_id: string;                   // FK -> users.clerk_id
  amount: number;                    // Positive = credit, negative = debit
  balance_after: number;
  type: "deduction" | "purchase" | "bonus" | "refund";
  description: string;
  generation_id: string | null;      // FK -> generations.id (optional)
  created_at: string;
}

// ─── Insert Types (omit server-generated fields) ────────────────────────────

export type DbUserInsert = Omit<DbUser, "id" | "created_at" | "updated_at">;

export type DbGenerationInsert = Omit<
  DbGeneration,
  "id" | "created_at" | "updated_at" | "video_url" | "thumbnail_url" | "progress" | "error_message"
>;

export type DbNotificationInsert = Omit<DbNotification, "id" | "created_at" | "read">;

export type DbCreditTransactionInsert = Omit<DbCreditTransaction, "id" | "created_at">;
