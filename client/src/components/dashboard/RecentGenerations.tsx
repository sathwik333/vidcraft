import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Video, Clock, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { MODELS, STYLES } from "@/lib/constants";

interface RecentVideo {
  id: string;
  model: string;
  style: string;
  status: "completed" | "processing" | "failed" | "pending";
  created_at: string;
  thumbnail_url: string | null;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  processing: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  pending: "bg-gold-500/10 text-gold-500 border-gold-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const gradients = [
  "from-purple-600/40 to-blue-600/40",
  "from-gold-500/40 to-orange-600/40",
  "from-emerald-600/40 to-teal-600/40",
  "from-pink-600/40 to-rose-600/40",
  "from-indigo-600/40 to-violet-600/40",
];

function getModelName(modelId: string): string {
  return MODELS.find((m) => m.id === modelId)?.name ?? modelId;
}

function getStyleName(styleId: string): string {
  return STYLES.find((s) => s.id === styleId)?.name ?? styleId;
}

export function RecentGenerations() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<RecentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const { data } = await api.get("/gallery", {
          params: { page: 1, limit: 5 },
        });
        setVideos(data.generations || []);
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecent();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass rounded-xl border border-[hsl(var(--border))] p-8"
      >
        <div className="space-y-4">
          <div className="h-5 w-48 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-16 animate-pulse rounded-lg bg-[hsl(var(--muted-foreground))]/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
                <div className="h-3 w-20 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass rounded-xl border border-[hsl(var(--border))] p-8"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted-foreground))]/10 mb-4">
            <Film className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
            Create your first one! Upload a photo and choose a style to generate
            a stunning video.
          </p>
          <Button
            onClick={() => navigate("/generate")}
            className="bg-gold-500 hover:bg-gold-600 text-black font-semibold"
          >
            Create Your First Video
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass rounded-xl border border-[hsl(var(--border))]"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Generations</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Your last {videos.length} generated videos
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/gallery")}
          className="text-gold-500 hover:text-gold-600"
        >
          View All
        </Button>
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        {videos.map((video, i) => (
          <motion.button
            key={video.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            onClick={() => navigate("/gallery")}
            className="flex w-full items-center gap-4 p-4 px-6 text-left transition-colors hover:bg-[hsl(var(--muted-foreground))]/5"
          >
            {/* Thumbnail placeholder */}
            <div
              className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[i % gradients.length]}`}
            >
              <Video className="h-5 w-5 text-white/80" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {getModelName(video.model)}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {getStyleName(video.style)}
              </p>
            </div>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={`shrink-0 capitalize ${statusColors[video.status] ?? statusColors.processing}`}
            >
              {video.status}
            </Badge>

            {/* Date */}
            <div className="hidden items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] sm:flex">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(video.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
