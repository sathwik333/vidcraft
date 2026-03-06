import type { Request } from "express";

// ─── Enums / Unions ─────────────────────────────────────────────────────────

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type Tier = "free" | "basic" | "pro";

export type ModelId =
  | "veo-3.1"
  | "runway-gen4-turbo"
  | "kling-2.1"
  | "sora-2";

export type StyleId =
  | "cinematic"
  | "anime"
  | "realistic"
  | "3d-render"
  | "watercolor"
  | "comic"
  | "oil-painting"
  | "none";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3";

// ─── Extended Express Request ───────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  userId: string;
}

// ─── Generation Request Body ────────────────────────────────────────────────

export interface CreateGenerationBody {
  model: ModelId;
  style: StyleId;
  prompt: string;
  duration: number;
  aspectRatio: AspectRatio;
  imageUrl: string;
}

// ─── Upload Response ────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
  path: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── API Response Helpers ───────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  data: T;
}

// ─── User Settings ──────────────────────────────────────────────────────────

export interface UserSettings {
  displayName?: string | undefined;
  emailNotifications?: boolean | undefined;
  marketingEmails?: boolean | undefined;
}
