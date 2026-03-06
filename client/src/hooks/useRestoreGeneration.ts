import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "@/lib/api";
import { useGenerationStore } from "@/stores/useGenerationStore";

interface ActiveGenerationResponse {
  active: boolean;
  id?: string;
  taskId?: string;
  model?: string;
  style?: string;
  prompt?: string;
  duration?: number;
  aspectRatio?: string;
  imageUrl?: string;
  status?: string;
  progress?: number;
}

/**
 * On mount, checks the server for an in-progress generation.
 * If found, restores the Zustand store so polling resumes automatically.
 */
export function useRestoreGeneration() {
  const { isSignedIn } = useAuth();
  const store = useGenerationStore();
  const checkedRef = useRef(false);

  useEffect(() => {
    // Only check once, only when signed in, and only if not already generating
    if (
      checkedRef.current ||
      !isSignedIn ||
      store.status !== "idle"
    ) {
      return;
    }
    checkedRef.current = true;

    async function checkActive() {
      try {
        const { data } = await api.get<ActiveGenerationResponse>(
          "/generate/active"
        );

        if (!data.active || !data.id) return;

        // Restore store state so the UI shows the progress tracker
        // and polling resumes
        if (data.model) store.setModel(data.model);
        if (data.style) store.setStyle(data.style);
        if (data.prompt) store.setPrompt(data.prompt);
        if (data.duration) store.setDuration(data.duration);
        if (data.aspectRatio) store.setAspectRatio(data.aspectRatio);
        if (data.imageUrl) store.setUploadedImageUrl(data.imageUrl);

        store.setGenerationId(data.id);
        store.setTaskId(data.taskId || null);
        store.setProgress(data.progress || 40);
        store.setStatus("polling");
      } catch {
        // Silent fail — user just sees the normal upload screen
      }
    }

    checkActive();
  }, [isSignedIn, store]);
}
