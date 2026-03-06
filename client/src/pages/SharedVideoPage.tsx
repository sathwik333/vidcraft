import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Download, ArrowRight } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

interface SharedVideo {
  id: string;
  model: string;
  style: string;
  video_url: string;
  duration: number;
  aspect_ratio: string;
  created_at: string;
}

export default function SharedVideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<SharedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const { data } = await api.get(`/gallery/${videoId}`);
        setVideo(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (videoId) fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-4 w-full max-w-2xl px-4">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !video) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            This video may have been deleted or the link is invalid.
          </p>
          <Link to="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Video player */}
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                src={video.video_url}
                controls
                autoPlay
                loop
                className="w-full"
              />
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary">{video.model}</Badge>
              <Badge variant="outline">{video.style}</Badge>
              <Badge variant="outline">{video.duration}s</Badge>
              <Badge variant="outline">{video.aspect_ratio}</Badge>
            </div>

            {/* Download */}
            {video.video_url && (
              <a href={video.video_url} download target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Video
                </Button>
              </a>
            )}

            {/* CTA */}
            <div className="glass rounded-xl p-8 text-center mt-8">
              <div className="flex items-center justify-center gap-2 text-gold-500 mb-3">
                <Sparkles className="h-6 w-6" />
                <span className="font-semibold text-lg">Made with VidCraft</span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                Create your own AI-powered videos from photos in seconds.
              </p>
              <Link to="/sign-up">
                <Button className="bg-gold-500 hover:bg-gold-600 text-white gap-2">
                  Try VidCraft Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
