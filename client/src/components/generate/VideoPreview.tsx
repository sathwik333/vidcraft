import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  RotateCcw,
  CheckCircle2,
  FileVideo,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { toast } from "sonner";

// Confetti particles for success celebration
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#EAB308", "#F59E0B", "#D97706", "#FBBF24", "#FCD34D"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x, scale: 1, rotate: 0 }}
      animate={{
        opacity: 0,
        y: 300,
        x: x + (Math.random() - 0.5) * 200,
        scale: 0,
        rotate: Math.random() * 720 - 360,
      }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className="absolute top-0 w-2 h-2 rounded-full pointer-events-none z-50"
      style={{ backgroundColor: color }}
    />
  );
}

export function VideoPreview() {
  const { status, resultVideoUrl, reset } = useGenerationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const isVisible = status === "completed" && resultVideoUrl;

  // Trigger confetti on first appearance
  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDownload = useCallback(
    (format: string) => {
      if (!resultVideoUrl) return;

      // In a real app, this would request the backend to convert/serve different formats
      const link = document.createElement("a");
      link.href = resultVideoUrl;
      link.download = `vidcraft-video.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading as ${format.toUpperCase()}...`);
    },
    [resultVideoUrl]
  );

  const handleShare = useCallback(() => {
    if (navigator.share && resultVideoUrl) {
      navigator.share({
        title: "My VidCraft Video",
        text: "Check out this video I made with VidCraft!",
        url: resultVideoUrl,
      });
    } else {
      toast.info("Share functionality coming soon!");
    }
  }, [resultVideoUrl]);

  const handleGenerateAnother = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
        >
          {/* Confetti overlay */}
          {showConfetti && (
            <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={Math.random() * 0.5}
                  x={Math.random() * 100}
                />
              ))}
            </div>
          )}

          {/* Success header */}
          <div className="px-6 pt-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  Your video is ready!
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Preview, download, or share your creation
                </p>
              </div>
            </motion.div>
          </div>

          {/* Video player */}
          <div className="relative bg-black/50 mx-4 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={resultVideoUrl}
              controls
              autoPlay
              loop
              className="w-full aspect-video object-contain"
            />
            {/* Free tier watermark notice */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/60 text-white/80 border-none text-[10px] backdrop-blur-sm">
                Free Tier - Watermarked
              </Badge>
            </div>
          </div>

          <Separator className="my-4 bg-[hsl(var(--border))]" />

          {/* Actions */}
          <div className="px-6 pb-6 space-y-4">
            {/* Download buttons */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Download
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload("mp4")}
                  className="border-[hsl(var(--border))] hover:border-gold-500/40 hover:text-gold-500"
                >
                  <FileVideo className="w-4 h-4 mr-1.5" />
                  MP4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload("webm")}
                  className="border-[hsl(var(--border))] hover:border-gold-500/40 hover:text-gold-500"
                >
                  <FileVideo className="w-4 h-4 mr-1.5" />
                  WebM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload("gif")}
                  className="border-[hsl(var(--border))] hover:border-gold-500/40 hover:text-gold-500"
                >
                  <FileImage className="w-4 h-4 mr-1.5" />
                  GIF
                </Button>
              </div>
            </div>

            {/* Share + Generate Another */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 border-[hsl(var(--border))] hover:border-gold-500/40"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleGenerateAnother}
                className={cn(
                  "flex-1",
                  "bg-gold-500 hover:bg-gold-600 text-black font-semibold"
                )}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Generate Another
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
