import { useCallback } from "react";
import { toast } from "sonner";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { useCreditsStore } from "@/stores/useCreditsStore";
import { usePollTask } from "@/hooks/usePollTask";
import api from "@/lib/api";

export function useGenerateVideo() {
  const store = useGenerationStore();
  const { fetchCredits } = useCreditsStore();

  const startGeneration = useCallback(async () => {
    if (!store.uploadedFile || !store.selectedModel || !store.selectedStyle) {
      toast.error("Please complete all fields before generating");
      return;
    }

    try {
      // Step 1: Upload image
      store.setStatus("uploading");
      store.setProgress(10);

      const formData = new FormData();
      formData.append("image", store.uploadedFile);

      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = uploadRes.data.url;
      store.setUploadedImageUrl(imageUrl);
      store.setProgress(30);

      // Step 2: Submit generation
      store.setStatus("generating");
      const genRes = await api.post("/generate", {
        model: store.selectedModel,
        style: store.selectedStyle,
        prompt: store.prompt,
        duration: store.duration,
        aspectRatio: store.aspectRatio,
        imageUrl,
      });

      store.setGenerationId(genRes.data.id);
      store.setTaskId(genRes.data.taskId);
      store.setStatus("polling");
      store.setProgress(40);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start generation";
      store.setStatus("failed");
      store.setErrorMessage(message);
      toast.error(message);
    }
  }, [store, fetchCredits]);

  // Polling
  usePollTask({
    generationId: store.generationId,
    enabled: store.status === "polling",
    onProgress: (progress) => {
      store.setProgress(40 + progress * 0.6); // Map 0-100 to 40-100
    },
    onComplete: (videoUrl) => {
      store.setResultVideoUrl(videoUrl);
      store.setStatus("completed");
      store.setProgress(100);
      fetchCredits(); // Refresh credit balance
      toast.success("Your video is ready!");
    },
    onError: (error) => {
      store.setStatus("failed");
      store.setErrorMessage(error);
      toast.error(error);
    },
  });

  return {
    startGeneration,
    reset: store.reset,
    status: store.status,
    progress: store.progress,
    resultVideoUrl: store.resultVideoUrl,
    errorMessage: store.errorMessage,
  };
}
