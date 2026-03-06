import { useState, useCallback } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { VideoGrid } from "@/components/gallery/VideoGrid";
import { VideoDetailModal } from "@/components/gallery/VideoDetailModal";
import { useVideoHistory } from "@/hooks/useVideoHistory";
import type { VideoHistoryItem } from "@/hooks/useVideoHistory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELS, STYLES } from "@/lib/constants";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { MagneticButton } from "@/components/animation/MagneticButton";

export default function GalleryPage() {
  const [page, setPage] = useState(1);
  const [modelFilter, setModelFilter] = useState<string | undefined>(undefined);
  const [styleFilter, setStyleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { videos, total, isLoading, deleteVideo } = useVideoHistory({
    page,
    limit: 12,
    model: modelFilter,
    style: styleFilter,
    status: statusFilter,
  });

  const [selectedVideo, setSelectedVideo] = useState<VideoHistoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const totalPages = Math.ceil(total / 12);

  const handlePlay = useCallback((video: VideoHistoryItem) => {
    setSelectedVideo(video);
    setDetailOpen(true);
  }, []);

  const handleDelete = useCallback(
    (video: VideoHistoryItem) => {
      setSelectedVideo(video);
      setDetailOpen(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(
    async (id: string) => {
      await deleteVideo(id);
    },
    [deleteVideo]
  );

  // Filter videos by search query on the client side
  const filteredVideos = searchQuery
    ? videos.filter(
        (v) =>
          v.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.style.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  return (
    <PageWrapper>
      <div className="space-y-6 p-6">
        {/* Page header */}
        <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Your Gallery</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Browse and manage all your generated videos in one place.
          </p>
        </ScrollReveal>

        {/* Filter bar — glass card */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Model filter */}
            <Select
              value={modelFilter ?? "all"}
              onValueChange={(v) => {
                setModelFilter(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Style filter */}
            <Select
              value={styleFilter ?? "all"}
              onValueChange={(v) => {
                setStyleFilter(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Styles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={statusFilter ?? "all"}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ScrollReveal>

        {/* Video grid */}
        <ScrollReveal delay={0.2}>
          <VideoGrid
            videos={filteredVideos}
            isLoading={isLoading}
            onPlay={handlePlay}
            onDelete={handleDelete}
          />
        </ScrollReveal>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <MagneticButton>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            </MagneticButton>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Page {page} of {totalPages}
            </span>
            <MagneticButton>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </MagneticButton>
          </div>
        )}

        {/* Video detail modal */}
        <VideoDetailModal
          video={selectedVideo}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onDelete={handleDeleteConfirm}
        />
      </div>
    </PageWrapper>
  );
}
