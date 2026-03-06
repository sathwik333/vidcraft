import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from "@/stores/useGenerationStore";

const ERROR_HINTS: Record<string, string> = {
  "Insufficient credits": "You don't have enough credits. Purchase more or wait for your free credits to refresh.",
  "Generation timed out": "The AI took too long. Try a shorter duration or a different model.",
  "Kie.ai API request failed": "The AI service is temporarily unavailable. Please try again in a few minutes.",
  "Video generation failed": "The AI could not generate a video from this image. Try a different photo or prompt.",
};

function getHint(error: string): string | null {
  for (const [key, hint] of Object.entries(ERROR_HINTS)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return hint;
    }
  }
  return null;
}

export function GenerationError() {
  const { status, errorMessage, reset } = useGenerationStore();

  if (status !== "failed" || !errorMessage) return null;

  const hint = getHint(errorMessage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-red-500/30 bg-red-500/5 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[hsl(var(--foreground))]">
            Generation Failed
          </h3>
          <p className="text-sm text-red-400 mt-1">
            {errorMessage}
          </p>
          {hint && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <HelpCircle className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {hint}
              </p>
            </div>
          )}
          <Button
            onClick={reset}
            className="mt-4 bg-gold-500 hover:bg-gold-600 text-black font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
