import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cpu, Film, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from "@/stores/useGenerationStore";

function getStatusConfig(status: string, progress: number) {
  switch (status) {
    case "uploading":
      return {
        icon: Upload,
        text: "Uploading photo...",
        hint: "This usually takes a few seconds",
      };
    case "generating":
      return {
        icon: Cpu,
        text: "Submitting to AI...",
        hint: "Preparing your generation request",
      };
    case "polling":
      return {
        icon: Film,
        text: `Generating video... ${Math.round(progress)}%`,
        hint: estimateTime(progress),
      };
    default:
      return {
        icon: Clock,
        text: "Processing...",
        hint: "",
      };
  }
}

function estimateTime(progress: number): string {
  if (progress < 20) return "Estimated time: ~2-3 minutes";
  if (progress < 50) return "Estimated time: ~1-2 minutes";
  if (progress < 80) return "Almost there... less than a minute";
  return "Finishing up...";
}

export function ProgressTracker() {
  const { status, progress, reset } = useGenerationStore();

  const isActive =
    status === "uploading" || status === "generating" || status === "polling";

  const config = useMemo(
    () => getStatusConfig(status, progress),
    [status, progress]
  );

  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: status === "polling" ? 360 : 0 }}
                  transition={{
                    duration: 2,
                    repeat: status === "polling" ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center"
                >
                  <Icon className="w-5 h-5 text-gold-500" />
                </motion.div>
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    {config.text}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    {config.hint}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-500 h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-3 rounded-full bg-[hsl(var(--border))] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-500 to-amber-400"
                animate={{ width: `${Math.max(progress, 2)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Percentage */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1">
                {["uploading", "generating", "polling"].map((step, idx) => {
                  const stepStates = ["uploading", "generating", "polling"];
                  const currentIdx = stepStates.indexOf(status);
                  const isComplete = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={step}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-300",
                        isComplete && "bg-gold-500",
                        isCurrent && "bg-gold-500 animate-pulse",
                        !isComplete && !isCurrent && "bg-[hsl(var(--border))]"
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
