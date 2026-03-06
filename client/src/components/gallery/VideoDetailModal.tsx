import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Share2,
  Trash2,
  AlertTriangle,
  Clock,
  Film,
  Cpu,
  Palette,
  RatioIcon,
  FileText,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { VideoHistoryItem } from "@/hooks/useVideoHistory";

interface VideoDetailModalProps {
  video: VideoHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function VideoDetailModal({
  video,
  open,
  onOpenChange,
  onDelete,
}: VideoDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!video) return null;

  const modelName = video.model
    .replace("runway-gen4-turbo", "Runway Gen-4 Turbo")
    .replace("veo-3.1", "Google Veo 3.1")
    .replace("kling-2.1", "Kling 2.1")
    .replace("sora-2", "Sora 2");

  const styleName = video.style
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  function handleDelete() {
    onDelete?.(video!.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  }

  function handleDownload(format: string) {
    if (video?.video_url) {
      const link = document.createElement("a");
      link.href = video.video_url;
      link.download = `vidcraft-${video.id}.${format}`;
      link.click();
    }
  }

  function handleShare() {
    if (video?.video_url && navigator.share) {
      navigator.share({
        title: `VidCraft - ${styleName} Video`,
        text: `Check out this ${styleName} video generated with ${modelName}`,
        url: video.video_url,
      });
    } else if (video?.video_url) {
      navigator.clipboard.writeText(video.video_url);
    }
  }

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Delete Video
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be
              undone. The video and all associated data will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{styleName} Video</DialogTitle>
          <DialogDescription>
            Generated with {modelName}
          </DialogDescription>
        </DialogHeader>

        {/* Video player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {video.video_url && video.status === "completed" ? (
            <video
              src={video.video_url}
              controls
              className="h-full w-full object-contain"
              poster={video.thumbnail_url ?? undefined}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600/30 to-blue-600/30">
              <div className="text-center">
                <Film className="mx-auto h-12 w-12 text-white/40 mb-2" />
                <p className="text-sm text-white/60">
                  {video.status === "processing"
                    ? "Video is still processing..."
                    : video.status === "failed"
                      ? "Video generation failed"
                      : "Video not available"}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
              <Cpu className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Model</p>
              <p className="text-sm font-medium">{modelName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
              <Palette className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Style</p>
              <p className="text-sm font-medium">{styleName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
              <Clock className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Duration</p>
              <p className="text-sm font-medium">{video.duration}s</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
              <RatioIcon className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Aspect Ratio
              </p>
              <p className="text-sm font-medium">{video.aspect_ratio}</p>
            </div>
          </div>
        </div>

        {/* Prompt */}
        {video.prompt && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Prompt
                </p>
              </div>
              <p className="text-sm text-[hsl(var(--foreground))]/80 rounded-lg bg-[hsl(var(--muted-foreground))]/5 p-3">
                {video.prompt}
              </p>
            </div>
          </>
        )}

        {/* Created date */}
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Clock className="h-3 w-3" />
          <span>
            Created{" "}
            {format(new Date(video.created_at), "MMM d, yyyy 'at' h:mm a")} (
            {formatDistanceToNow(new Date(video.created_at), {
              addSuffix: true,
            })}
            )
          </span>
          {video.is_watermarked && (
            <Badge variant="outline" className="ml-auto text-xs">
              Watermarked
            </Badge>
          )}
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {video.status === "completed" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("mp4")}
              >
                <Download className="mr-2 h-4 w-4" />
                MP4
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("webm")}
              >
                <Download className="mr-2 h-4 w-4" />
                WebM
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("gif")}
              >
                <Download className="mr-2 h-4 w-4" />
                GIF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
