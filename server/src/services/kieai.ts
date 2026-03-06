import axios from "axios";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type {
  KieApiResponse,
  KieSubmitData,
  KieRunwayStatusData,
  SubmitGenerationParams,
  TaskStatusResult,
} from "../types/kieai.js";

// ─── Axios Instance ─────────────────────────────────────────────────────────

const kieClient = axios.create({
  baseURL: config.KIE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.KIE_API_KEY}`,
  },
  timeout: 30_000,
});

// ─── Model → endpoint mapping ──────────────────────────────────────────────

interface ModelEndpoints {
  generatePath: string;
  statusPath: (taskId: string) => string;
  buildPayload: (params: SubmitGenerationParams) => Record<string, unknown>;
  parseStatus: (data: unknown) => TaskStatusResult;
}

// ─── Unified API helpers (Kling, Sora, etc.) ────────────────────────────────

const UNIFIED_GENERATE_PATH = "/api/v1/jobs/createTask";
const UNIFIED_STATUS_PATH = (taskId: string) =>
  `/api/v1/jobs/recordInfo?taskId=${taskId}`;

function parseUnifiedStatus(raw: unknown): TaskStatusResult {
  const data = raw as Record<string, unknown>;
  let status: TaskStatusResult["status"] = "processing";
  let progress = 50;
  let videoUrl: string | null = null;
  let errorMessage: string | null = null;

  logger.info("Unified status response", { data: JSON.stringify(data) });

  const state = data.state as string | undefined;

  if (state === "success") {
    status = "completed";
    progress = 100;

    // Video URL is inside resultJson (a JSON string)
    const resultJson = data.resultJson as string | undefined;
    if (resultJson) {
      try {
        const parsed = JSON.parse(resultJson);
        const urls = parsed.resultUrls;
        if (Array.isArray(urls) && urls.length > 0) {
          videoUrl = urls[0];
        } else if (typeof urls === "string") {
          videoUrl = urls;
        }
      } catch {
        logger.warn("Failed to parse resultJson", { resultJson });
      }
    }

    if (!videoUrl) {
      logger.warn("Unified: completed but no video URL found", {
        keys: Object.keys(data),
      });
    }
  } else if (state === "fail") {
    status = "failed";
    progress = 0;
    const internalReason = (data.failMsg as string) || "Unknown failure";
    logger.error("Unified model generation failed", { failMsg: internalReason });
    errorMessage = "Video generation failed. Please try again.";
  } else if (state === "waiting" || state === "queuing") {
    status = "processing";
    progress = 25;
  } else if (state === "generating") {
    status = "processing";
    const rawProgress = data.progress as number | undefined;
    progress = rawProgress && rawProgress > 0 ? rawProgress : 60;
  }

  return {
    taskId: (data.taskId as string) || "",
    status,
    progress,
    videoUrl,
    thumbnailUrl: null,
    errorMessage,
  };
}

// ─── Per-model configurations ───────────────────────────────────────────────

const MODEL_ENDPOINTS: Record<string, ModelEndpoints> = {
  // ── Google Veo 3.1 (legacy endpoint) ──────────────────────────────────
  "veo-3.1": {
    generatePath: "/api/v1/veo/generate",
    statusPath: (taskId) => `/api/v1/veo/record-info?taskId=${taskId}`,
    buildPayload: (params) => ({
      prompt: params.prompt,
      model: "veo3_fast",
      aspect_ratio: params.aspectRatio,
      generationType: "REFERENCE_2_VIDEO",
      imageUrls: [params.imageUrl],
    }),
    parseStatus: (raw) => {
      const data = raw as Record<string, unknown>;
      let status: TaskStatusResult["status"] = "processing";
      let progress = 50;
      let videoUrl: string | null = null;
      let errorMessage: string | null = null;

      logger.info("Veo status response", { data: JSON.stringify(data) });

      const successFlag = data.successFlag as number | undefined;

      if (successFlag === 1) {
        status = "completed";
        progress = 100;

        const resultUrls = data.resultUrls as string | null | undefined;
        const videoUrlField = data.videoUrl as string | undefined;
        const resultUrl = data.resultUrl as string | undefined;
        const url = data.url as string | undefined;

        if (resultUrls) {
          try {
            const urls = JSON.parse(resultUrls);
            videoUrl = Array.isArray(urls) ? urls[0] : urls;
          } catch {
            videoUrl = resultUrls;
          }
        } else if (videoUrlField) {
          videoUrl = videoUrlField;
        } else if (resultUrl) {
          videoUrl = resultUrl;
        } else if (url) {
          videoUrl = url;
        }

        if (!videoUrl) {
          logger.warn("Veo completed but no video URL found in response", {
            keys: Object.keys(data),
          });
        }
      } else if (successFlag === 2 || successFlag === 3) {
        status = "failed";
        progress = 0;
        const internalReason = (data.failMsg as string) || "Unknown Veo failure";
        logger.error("Veo generation failed", { failMsg: internalReason });
        errorMessage = "Video generation failed. Please try again.";
      } else {
        status = "processing";
        progress = 50;
      }

      return {
        taskId: (data.taskId as string) || "",
        status,
        progress,
        videoUrl,
        thumbnailUrl: null,
        errorMessage,
      };
    },
  },

  // ── Runway Gen-4 Turbo (legacy endpoint) ──────────────────────────────
  "runway-gen4-turbo": {
    generatePath: "/api/v1/runway/generate",
    statusPath: (taskId) => `/api/v1/runway/record-detail?taskId=${taskId}`,
    buildPayload: (params) => ({
      prompt: params.prompt,
      duration: params.duration,
      quality: "720p",
      imageUrl: params.imageUrl,
      waterMark: "",
      callBackUrl: "",
    }),
    parseStatus: (raw) => {
      const data = raw as KieRunwayStatusData;
      let status: TaskStatusResult["status"] = "processing";
      let progress = 50;
      let videoUrl: string | null = null;
      let errorMessage: string | null = null;

      if (data.state === "success" && data.videoInfo) {
        status = "completed";
        progress = 100;
        videoUrl = data.videoInfo.videoUrl;
      } else if (data.state === "fail") {
        status = "failed";
        progress = 0;
        const internalReason = data.failMsg || "Unknown Runway failure";
        logger.error("Runway Gen-4 generation failed", { failMsg: internalReason });
        errorMessage = "Video generation failed. Please try again.";
      } else if (data.state === "wait" || data.state === "queueing") {
        status = "processing";
        progress = 25;
      } else if (data.state === "generating") {
        status = "processing";
        progress = 60;
      }

      return {
        taskId: data.taskId,
        status,
        progress,
        videoUrl,
        thumbnailUrl: data.videoInfo?.imageUrl || null,
        errorMessage,
      };
    },
  },

  // ── Kling 2.1 (unified endpoint) ─────────────────────────────────────
  "kling-2.1": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "kling/v2-1-master-image-to-video",
      input: {
        prompt: params.prompt,
        image_url: params.imageUrl,
        duration: String(params.duration),
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Sora 2 (unified endpoint) ────────────────────────────────────────
  "sora-2": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "sora-2-image-to-video",
      input: {
        prompt: params.prompt,
        image_urls: [params.imageUrl],
        aspect_ratio:
          params.aspectRatio === "9:16" ? "portrait" : "landscape",
        n_frames: String(Math.min(params.duration, 15)),
        remove_watermark: true,
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Kling 3.0 (unified endpoint) ─────────────────────────────────────
  "kling-3.0": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "kling-3.0",
      input: {
        prompt: params.prompt,
        image_urls: [params.imageUrl],
        sound: true,
        duration: String(params.duration),
        aspect_ratio: params.aspectRatio,
        mode: "pro",
        multi_shots: false,
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Kling 2.5 Turbo (unified endpoint) ───────────────────────────────
  "kling-2.5-turbo": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "kling/v2-5-turbo-text-to-video-pro",
      input: {
        prompt: params.prompt,
        image_url: params.imageUrl,
        duration: String(params.duration),
        aspect_ratio: params.aspectRatio,
        negative_prompt: "blur, distort, and low quality",
        cfg_scale: 0.5,
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Hailuo 2.3 (unified endpoint) ────────────────────────────────────
  "hailuo-2.3": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "hailuo/2-3-image-to-video-pro",
      input: {
        prompt: params.prompt,
        image_url: params.imageUrl,
        duration: String(params.duration),
        resolution: "768P",
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Wan 2.6 (unified endpoint) ───────────────────────────────────────
  "wan-2.6": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "wan/2-6-image-to-video",
      input: {
        prompt: params.prompt,
        image_urls: [params.imageUrl],
        duration: String(params.duration),
        resolution: "1080p",
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Bytedance Seedance (unified endpoint) ────────────────────────────
  "bytedance-seedance": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "bytedance/v1-pro-text-to-video",
      input: {
        prompt: params.prompt,
        image_url: params.imageUrl,
        aspect_ratio: params.aspectRatio,
        resolution: "720p",
        duration: String(params.duration),
        camera_fixed: false,
        seed: -1,
        enable_safety_checker: true,
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Grok Imagine (unified endpoint) ──────────────────────────────────
  "grok-imagine": {
    generatePath: UNIFIED_GENERATE_PATH,
    statusPath: UNIFIED_STATUS_PATH,
    buildPayload: (params) => ({
      model: "grok-imagine/image-to-video",
      input: {
        prompt: params.prompt,
        image_urls: [params.imageUrl],
        mode: "normal",
        duration: String(params.duration),
        resolution: "480p",
      },
    }),
    parseStatus: parseUnifiedStatus,
  },

  // ── Runway Aleph (legacy Runway endpoint) ────────────────────────────
  "runway-aleph": {
    generatePath: "/api/v1/runway/generate",
    statusPath: (taskId) => `/api/v1/runway/record-detail?taskId=${taskId}`,
    buildPayload: (params) => ({
      prompt: params.prompt,
      duration: params.duration,
      quality: "720p",
      imageUrl: params.imageUrl,
      aspectRatio: params.aspectRatio,
      waterMark: "",
      callBackUrl: "",
    }),
    parseStatus: (raw) => {
      const data = raw as KieRunwayStatusData;
      let status: TaskStatusResult["status"] = "processing";
      let progress = 50;
      let videoUrl: string | null = null;
      let errorMessage: string | null = null;

      if (data.state === "success" && data.videoInfo) {
        status = "completed";
        progress = 100;
        videoUrl = data.videoInfo.videoUrl;
      } else if (data.state === "fail") {
        status = "failed";
        progress = 0;
        const internalReason = data.failMsg || "Unknown Runway Aleph failure";
        logger.error("Runway Aleph generation failed", { failMsg: internalReason });
        errorMessage = "Video generation failed. Please try again.";
      } else if (data.state === "wait" || data.state === "queueing") {
        status = "processing";
        progress = 25;
      } else if (data.state === "generating") {
        status = "processing";
        progress = 60;
      }

      return {
        taskId: data.taskId,
        status,
        progress,
        videoUrl,
        thumbnailUrl: data.videoInfo?.imageUrl || null,
        errorMessage,
      };
    },
  },
};

// ─── Submit a Generation Task ───────────────────────────────────────────────

export async function submitGeneration(
  params: SubmitGenerationParams
): Promise<{ taskId: string }> {
  const endpoints = MODEL_ENDPOINTS[params.model];
  if (!endpoints) {
    throw Object.assign(new Error(`Unsupported model: ${params.model}`), {
      statusCode: 400,
      code: "INVALID_MODEL",
    });
  }

  const payload = endpoints.buildPayload(params);

  logger.info("Submitting generation to Kie.ai", {
    model: params.model,
    path: endpoints.generatePath,
    payload: JSON.stringify(payload),
  });

  try {
    const response = await kieClient.post<KieApiResponse<KieSubmitData>>(
      endpoints.generatePath,
      payload
    );

    if (response.data.code !== 200) {
      throw Object.assign(new Error(response.data.msg || "Kie.ai API error"), {
        statusCode: 502,
        code: "KIE_API_ERROR",
      });
    }

    const taskId = response.data.data.taskId;
    logger.info("Kie.ai generation submitted", { taskId, model: params.model });
    return { taskId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const internalMsg =
        (error.response?.data as { msg?: string } | undefined)?.msg ??
        "Kie.ai API request failed";

      logger.error("Kie.ai submit error", { status, msg: internalMsg, model: params.model });

      throw Object.assign(
        new Error("Video generation service is temporarily unavailable. Please try again."),
        { statusCode: status >= 500 ? 502 : status, code: "KIE_API_ERROR" }
      );
    }
    throw error;
  }
}

// ─── Get Task Status ────────────────────────────────────────────────────────

export async function getTaskStatus(
  taskId: string,
  model: string = "veo-3.1"
): Promise<TaskStatusResult> {
  const endpoints = MODEL_ENDPOINTS[model] ?? MODEL_ENDPOINTS["veo-3.1"]!;

  try {
    const response = await kieClient.get<KieApiResponse<unknown>>(
      endpoints.statusPath(taskId)
    );

    if (response.data.code !== 200) {
      throw Object.assign(
        new Error(response.data.msg || "Failed to get task status"),
        { statusCode: 502, code: "KIE_STATUS_ERROR" }
      );
    }

    return endpoints.parseStatus(response.data.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const internalMsg =
        (error.response?.data as { msg?: string } | undefined)?.msg ??
        "Failed to get task status from Kie.ai";

      logger.error("Kie.ai status poll error", { taskId, status, msg: internalMsg });

      throw Object.assign(
        new Error("Unable to check generation status. Please try again."),
        { statusCode: status >= 500 ? 502 : status, code: "KIE_STATUS_ERROR" }
      );
    }
    throw error;
  }
}
