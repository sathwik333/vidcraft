import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import type { DbGeneration, DbGenerationInsert } from "../types/database.js";
import type { GenerationStatus } from "../types/index.js";

// ─── Create Generation ──────────────────────────────────────────────────────

export async function createGeneration(
  params: DbGenerationInsert
): Promise<DbGeneration> {
  const { data, error } = await supabase
    .from("generations")
    .insert({
      ...params,
      video_url: null,
      thumbnail_url: null,
      progress: 0,
      error_message: null,
    })
    .select("*")
    .single();

  if (error) {
    logger.error("Failed to create generation", {
      userId: params.user_id,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to create generation record"), {
      statusCode: 500,
      code: "GENERATION_CREATE_ERROR",
    });
  }

  logger.info("Generation created", {
    id: (data as DbGeneration).id,
    userId: params.user_id,
    model: params.model,
  });

  return data as DbGeneration;
}

// ─── Update Generation Status ───────────────────────────────────────────────

export async function updateGenerationStatus(
  id: string,
  status: GenerationStatus,
  additionalData?: {
    progress?: number | undefined;
    videoUrl?: string | undefined;
    thumbnailUrl?: string | undefined;
    errorMessage?: string | undefined;
  }
): Promise<DbGeneration> {
  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (additionalData?.progress !== undefined) {
    updatePayload["progress"] = additionalData.progress;
  }
  if (additionalData?.videoUrl !== undefined) {
    updatePayload["video_url"] = additionalData.videoUrl;
  }
  if (additionalData?.thumbnailUrl !== undefined) {
    updatePayload["thumbnail_url"] = additionalData.thumbnailUrl;
  }
  if (additionalData?.errorMessage !== undefined) {
    updatePayload["error_message"] = additionalData.errorMessage;
  }

  const { data, error } = await supabase
    .from("generations")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    logger.error("Failed to update generation status", {
      id,
      status,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to update generation"), {
      statusCode: 500,
      code: "GENERATION_UPDATE_ERROR",
    });
  }

  logger.info("Generation status updated", { id, status });
  return data as DbGeneration;
}

// ─── Get Generations by User (Paginated) ────────────────────────────────────

export async function getGenerationsByUser(
  userId: string,
  page: number,
  limit: number,
  filters?: { model?: string; style?: string; status?: string }
): Promise<{ generations: DbGeneration[]; total: number }> {
  const offset = (page - 1) * limit;

  // Build count query with filters
  let countQuery = supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (filters?.model) countQuery = countQuery.eq("model", filters.model);
  if (filters?.style) countQuery = countQuery.eq("style", filters.style);
  if (filters?.status) countQuery = countQuery.eq("status", filters.status);

  const { count, error: countError } = await countQuery;

  if (countError) {
    logger.error("Failed to count generations", {
      userId,
      error: countError.message,
    });
    throw Object.assign(new Error("Failed to fetch generations"), {
      statusCode: 500,
      code: "GENERATION_FETCH_ERROR",
    });
  }

  // Build data query with filters
  let dataQuery = supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.model) dataQuery = dataQuery.eq("model", filters.model);
  if (filters?.style) dataQuery = dataQuery.eq("style", filters.style);
  if (filters?.status) dataQuery = dataQuery.eq("status", filters.status);

  const { data, error } = await dataQuery;

  if (error) {
    logger.error("Failed to fetch generations", {
      userId,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to fetch generations"), {
      statusCode: 500,
      code: "GENERATION_FETCH_ERROR",
    });
  }

  return {
    generations: (data ?? []) as DbGeneration[],
    total: count ?? 0,
  };
}

// ─── Get Active Generation for User ─────────────────────────────────────────

export async function getActiveGeneration(
  userId: string
): Promise<DbGeneration | null> {
  // Only consider generations from the last 15 minutes
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["pending", "processing"])
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error("Failed to fetch active generation", {
      userId,
      error: error.message,
    });
    return null;
  }

  // If no recent active generation, mark any old stuck ones as failed
  if (!data) {
    supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: "Generation timed out",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .in("status", ["pending", "processing"])
      .lt("created_at", cutoff)
      .then(() => {});
  }

  return data as DbGeneration | null;
}

// ─── Get Single Generation ──────────────────────────────────────────────────

export async function getGenerationById(
  id: string
): Promise<DbGeneration | null> {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found
      return null;
    }
    logger.error("Failed to fetch generation", {
      id,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to fetch generation"), {
      statusCode: 500,
      code: "GENERATION_FETCH_ERROR",
    });
  }

  return data as DbGeneration;
}

// ─── Delete Generation ──────────────────────────────────────────────────────

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("Failed to delete generation", {
      id,
      error: error.message,
    });
    throw Object.assign(new Error("Failed to delete generation"), {
      statusCode: 500,
      code: "GENERATION_DELETE_ERROR",
    });
  }

  logger.info("Generation deleted", { id });
}
