import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface VideoHistoryItem {
  id: string;
  model: string;
  style: string;
  prompt: string;
  image_url: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number;
  aspect_ratio: string;
  status: string;
  credits_cost: number;
  is_watermarked: boolean;
  created_at: string;
  completed_at: string | null;
}

interface UseVideoHistoryOptions {
  page?: number;
  limit?: number;
  model?: string;
  style?: string;
  status?: string;
}

export function useVideoHistory(options: UseVideoHistoryOptions = {}) {
  const { page = 1, limit = 20, model, style, status } = options;
  const [videos, setVideos] = useState<VideoHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (model) params.set("model", model);
      if (style) params.set("style", style);
      if (status) params.set("status", status);

      const { data } = await api.get(`/gallery?${params.toString()}`);
      setVideos(data.generations || []);
      setTotal(data.total || 0);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, model, style, status]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const deleteVideo = useCallback(async (id: string) => {
    try {
      await api.delete(`/gallery/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      // silently fail
    }
  }, []);

  return { videos, total, isLoading, refetch: fetchVideos, deleteVideo };
}
