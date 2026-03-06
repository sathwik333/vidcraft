// ─── Kie.ai API – Common Response Wrapper ───────────────────────────────────

export interface KieApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// ─── Kie.ai API – Submit Response ───────────────────────────────────────────

export interface KieSubmitData {
  taskId: string;
}

// ─── Kie.ai API – Veo Status ───────────────────────────────────────────────

export interface KieVeoStatusData {
  taskId: string;
  successFlag: number; // 0=generating, 1=success, 2=failed, 3=gen failed
  resultUrls: string | null; // JSON string of video URLs when complete
}

// ─── Kie.ai API – Runway Status ─────────────────────────────────────────────

export interface KieRunwayStatusData {
  taskId: string;
  state: "wait" | "queueing" | "generating" | "success" | "fail";
  videoInfo?: {
    videoId: string;
    videoUrl: string;
    imageUrl: string;
  };
  failCode?: number;
  failMsg?: string;
}

// ─── Internal Params (our app -> service layer) ────────────────────────────

export interface SubmitGenerationParams {
  model: string; // Our internal model ID (e.g. "veo-3.1")
  imageUrl: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  style: string;
}

export type KieTaskStatus = "pending" | "processing" | "completed" | "failed";

export interface TaskStatusResult {
  taskId: string;
  status: KieTaskStatus;
  progress: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
}
