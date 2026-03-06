import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "@/components/gallery/VideoCard";
import type { VideoHistoryItem } from "@/hooks/useVideoHistory";

interface VideoGridProps {
  videos: VideoHistoryItem[];
  isLoading: boolean;
  onPlay?: (video: VideoHistoryItem) => void;
  onDelete?: (video: VideoHistoryItem) => void;
}

function VideoCardSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted-foreground))]/10 mb-6">
        <Film className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No videos found</h3>
      <p className="text-[hsl(var(--muted-foreground))] max-w-md">
        No videos match your current filters. Try adjusting your search criteria
        or generate a new video to get started.
      </p>
    </motion.div>
  );
}

export function VideoGrid({ videos, isLoading, onPlay, onDelete }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, i) => (
        <VideoCard
          key={video.id}
          video={video}
          index={i}
          onPlay={onPlay}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
