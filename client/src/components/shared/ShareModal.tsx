import { useState } from "react";
import { Copy, Check, Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  videoId: string;
}

export function ShareModal({ open, onOpenChange, videoUrl, videoId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/v/${videoId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent("Check out this AI-generated video I made with VidCraft!");
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link */}
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="text-sm" />
            <Button size="icon" variant="outline" onClick={copyLink}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareToTwitter}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareToFacebook}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareToLinkedIn}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </div>

          {/* Direct video link */}
          {videoUrl && (
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                Direct video URL
              </p>
              <div className="flex items-center gap-2">
                <Input value={videoUrl} readOnly className="text-xs" />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(videoUrl);
                    toast.success("Video URL copied");
                  }}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
