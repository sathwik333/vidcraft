import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Square,
  Tablet,
  Clock,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { MODELS } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

const aspectRatioIcons: Record<string, { icon: LucideIcon; label: string; useCase: string }> = {
  "16:9": { icon: Monitor, label: "Landscape", useCase: "Desktop / YouTube" },
  "9:16": { icon: Smartphone, label: "Portrait", useCase: "Reels / TikTok" },
  "1:1": { icon: Square, label: "Square", useCase: "Instagram / Feed" },
  "4:3": { icon: Tablet, label: "Classic", useCase: "Presentation / Tablet" },
};

export function DurationRatioSelector() {
  const {
    selectedModel,
    duration,
    aspectRatio,
    setDuration,
    setAspectRatio,
  } = useGenerationStore();

  const model = useMemo(
    () => MODELS.find((m) => m.id === selectedModel),
    [selectedModel]
  );

  const creditCost = useMemo(() => {
    if (!model) return 0;
    return model.creditCost[duration] ?? 0;
  }, [model, duration]);

  if (!model) return null;

  return (
    <div className="space-y-6">
      {/* Duration selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
          <Clock className="w-4 h-4" />
          Duration
        </label>
        <div className="flex flex-wrap gap-2">
          {model.durations.map((d) => {
            const isActive = duration === d;
            return (
              <motion.button
                key={d}
                onClick={() => setDuration(d)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-gold-500/15 text-gold-500 border-gold-500"
                    : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:border-gold-500/40"
                )}
              >
                {d}s
                {isActive && (
                  <motion.div
                    layoutId="duration-active"
                    className="absolute inset-0 rounded-lg border-2 border-gold-500 pointer-events-none"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Aspect ratio selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
          <Monitor className="w-4 h-4" />
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {model.aspectRatios.map((ar) => {
            const isActive = aspectRatio === ar;
            const config = aspectRatioIcons[ar];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <motion.button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-gold-500/15 text-gold-500 border-gold-500"
                    : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:border-gold-500/40"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-xs">{config.useCase}</span>
                <span className={cn(
                  "text-[10px]",
                  isActive ? "text-gold-500/70" : "text-[hsl(var(--muted-foreground))]"
                )}>
                  {ar}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="ratio-active"
                    className="absolute inset-0 rounded-xl border-2 border-gold-500 pointer-events-none"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Credit cost */}
      <motion.div
        key={creditCost}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gold-500/10 border border-gold-500/20"
      >
        <Coins className="w-4 h-4 text-gold-500" />
        <span className="text-sm text-[hsl(var(--foreground))]">
          This configuration costs{" "}
          <span className="font-bold text-gold-500">{creditCost} credit{creditCost !== 1 ? "s" : ""}</span>
        </span>
      </motion.div>
    </div>
  );
}
