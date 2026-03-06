import { useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

interface PollResult {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  videoUrl?: string;
  error?: string;
}

interface UsePollTaskOptions {
  generationId: string | null;
  enabled: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

export function usePollTask({
  generationId,
  enabled,
  onProgress,
  onComplete,
  onError,
}: UsePollTaskOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);
  const maxAttempts = 120; // 10 minutes at 5s intervals

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    attemptRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled || !generationId) {
      cleanup();
      return;
    }

    const poll = async () => {
      attemptRef.current += 1;

      if (attemptRef.current > maxAttempts) {
        cleanup();
        onError?.("Generation timed out. Please try again.");
        return;
      }

      try {
        const { data } = await api.get<PollResult>(
          `/generate/${generationId}/status`
        );

        if (data.progress !== undefined) {
          onProgress?.(data.progress);
        }

        if (data.status === "completed" && data.videoUrl) {
          cleanup();
          onComplete?.(data.videoUrl);
        } else if (data.status === "failed") {
          cleanup();
          onError?.(data.error || "Generation failed");
        }
      } catch {
        // Network error — keep polling
      }
    };

    // Start polling immediately, then every 3-5s with backoff
    poll();
    const getInterval = () => {
      if (attemptRef.current < 10) return 3000;
      if (attemptRef.current < 30) return 5000;
      return 8000; // slow down after 2.5 minutes
    };

    intervalRef.current = setInterval(poll, getInterval());

    return cleanup;
  }, [enabled, generationId, cleanup, onProgress, onComplete, onError]);

  return { cancel: cleanup };
}
