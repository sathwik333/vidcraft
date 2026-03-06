import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Download,
  Trash2,
  Clock,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { VideoHistoryItem } from "@/hooks/useVideoHistory";

import { MODELS } from "@/lib/constants";

interface VideoCardProps {
  video: VideoHistoryItem;
  index?: number;
  onPlay?: (video: VideoHistoryItem) => void;
  onDelete?: (video: VideoHistoryItem) => void;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  processing: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  queued: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const gradients = [
  "from-purple-600/50 to-blue-600/50",
  "from-gold-500/50 to-orange-600/50",
  "from-emerald-600/50 to-teal-600/50",
  "from-pink-600/50 to-rose-600/50",
  "from-indigo-600/50 to-violet-600/50",
  "from-cyan-600/50 to-sky-600/50",
];

export function VideoCard({ video, index = 0, onPlay, onDelete }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const gradient = gradients[index % gradients.length];

  const modelName =
    MODELS.find((m) => m.id === video.model)?.name ?? video.model;

  const styleName = video.style
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group glass rounded-xl border border-[hsl(var(--border))] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={`Video ${video.id}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : video.image_url ? (
          <img
            src={video.image_url}
            alt={`Source image for ${video.id}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <Video className="h-10 w-10 text-white/60" />
          </div>
        )}

        {/* Status indicator */}
        {video.status === "processing" && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
              <span className="text-xs text-white font-medium">Processing</span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px]"
        >
          {video.status === "completed" && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 w-9 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.(video);
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 w-9 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (video.video_url) {
                    window.open(video.video_url, "_blank");
                  }
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 p-0 rounded-full hover:bg-red-500/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(video);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white font-medium">
            {video.duration}s
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Badge
              variant="outline"
              className="mb-2 border-gold-500/30 bg-gold-500/10 text-gold-500 text-xs"
            >
              {modelName}
            </Badge>
            <p className="text-sm font-medium truncate">{styleName}</p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 capitalize text-xs ${statusColors[video.status] ?? statusColors.completed}`}
          >
            {video.status}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(video.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
