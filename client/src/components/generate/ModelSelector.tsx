import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Clock,
  RectangleHorizontal,
  Volume2,
  VolumeX,
  Palette,
  Cloud,
  Clapperboard,
  Share2,
  Zap,
  Star,
  Check,
} from "lucide-react";
import {
  SiGoogle,
  SiKuaishou,
  SiOpenai,
  SiX,
  SiBytedance
} from "react-icons/si";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { MODELS, MODEL_CATEGORIES } from "@/lib/constants";

const modelIcons: Record<string, React.ReactNode> = {
  "veo-3.1": <SiGoogle className="w-5 h-5" />,
  "kling-2.1": <SiKuaishou className="w-5 h-5" />,
  "kling-2.5-turbo": <SiKuaishou className="w-5 h-5" />,
  "kling-3.0": <SiKuaishou className="w-5 h-5" />,
  "hailuo-2.3": <Clapperboard className="w-5 h-5" />,
  "wan-2.6": <Cloud className="w-5 h-5" />,
  "bytedance-seedance": <SiBytedance className="w-5 h-5" />,
  "grok-imagine": <SiX className="w-5 h-5" />,
  "runway-gen4-turbo": <Film className="w-5 h-5" />,
  "runway-aleph": <Palette className="w-5 h-5" />,
  "sora-2": <SiOpenai className="w-5 h-5" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  Clapperboard: <Clapperboard className="w-6 h-6" />,
  Share2: <Share2 className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Volume2: <Volume2 className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
};

export function ModelSelector() {
  const { selectedModel, setModel, setDuration, setAspectRatio } =
    useGenerationStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectModel = (modelId: string) => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return;

    setModel(modelId);
    setDuration(model.durations[0]);
    setAspectRatio(model.aspectRatios[0]);
  };

  const renderModelCard = (modelId: string, type: "basic" | "premium") => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return null;

    const isSelected = selectedModel === model.id;

    return (
      <motion.button
        key={model.id}
        onClick={() => handleSelectModel(model.id)}
        className={cn(
          "relative flex flex-col text-left rounded-xl border p-4 transition-all duration-200 h-full w-full overflow-hidden",
          "bg-[hsl(var(--card))]",
          "hover:shadow-[0_0_15px_-3px_hsl(var(--foreground)/0.1)] hover:border-[hsl(var(--foreground)/0.2)]",
          isSelected &&
          "border-gold-500 bg-gold-500/5 shadow-[0_0_20px_-5px_hsl(45,93%,47%,0.2)]",
          !isSelected && "border-[hsl(var(--border))]"
        )}
      >

        <div className="flex items-start justify-between mb-3 w-full">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                isSelected
                  ? "bg-gold-500/20 text-gold-500"
                  : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--foreground))]"
              )}
            >
              {modelIcons[model.id]}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-base text-[hsl(var(--foreground))]">
                  {model.name}
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-0.5 text-[11px] px-1.5 py-0.5",
                  type === "premium"
                    ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                    : "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                )}
              >
                {type === "premium" ? (
                  <span className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> Best Quality
                  </span>
                ) : (
                  "Most Affordable"
                )}
              </Badge>
            </div>
          </div>

          {isSelected && (
            <div className="shrink-0 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-black" />
            </div>
          )}
        </div>

        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">
          {model.description}
        </p>

        <div className="mt-auto pt-3 border-t border-[hsl(var(--border))]/50 w-full space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Quality</span>
            <span className="font-medium text-[hsl(var(--foreground))]">{model.maxQuality}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Audio</span>
            <span className="font-medium flex items-center gap-1 text-[hsl(var(--foreground))]">
              {model.hasAudio ? (
                <><Volume2 className="w-3 h-3 text-emerald-500" /> Yes</>
              ) : (
                <><VolumeX className="w-3 h-3 text-[hsl(var(--muted-foreground))]/60" /> No</>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Max Duration</span>
            <span className="font-medium text-[hsl(var(--foreground))] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {Math.max(...model.durations)}s
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Aspect Ratios</span>
            <span className="font-medium text-[hsl(var(--foreground))] flex items-center gap-1">
              <RectangleHorizontal className="w-3 h-3" /> {model.aspectRatios.length} Formats
            </span>
          </div>
        </div>

        {/* Selected outline */}
        {isSelected && (
          <motion.div
            layoutId="model-selected-ring"
            className="absolute inset-0 rounded-xl border border-gold-500/50 pointer-events-none"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Category Selection */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODEL_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => {
                  if (selectedCategory === category.id) {
                    setSelectedCategory(null);
                    setModel(null);
                  } else {
                    setSelectedCategory(category.id);
                    setModel(null); // Reset model when category changes so user makes explicit choice
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 text-center rounded-xl border transition-all duration-200 overflow-hidden",
                  isSelected
                    ? "border-gold-500 bg-gold-500/10 text-gold-500 shadow-[0_0_15px_-3px_hsl(45,93%,47%,0.15)]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] text-[hsl(var(--muted-foreground))]"
                )}
              >
                {/* Selected inner highlight */}
                {isSelected && (
                  <motion.div
                    layoutId="category-selected-ring"
                    className="absolute inset-0 rounded-xl border border-gold-500/50 pointer-events-none"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="mb-2 shrink-0 text-inherit relative z-10">
                  {categoryIcons[category.icon as string]}
                </div>
                <h3 className={cn("text-base font-semibold mb-1", isSelected ? "text-gold-500" : "text-[hsl(var(--foreground))]")}>
                  {category.name}
                </h3>
                <p className="text-xs opacity-70 leading-tight hidden sm:block">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Basic vs Premium Selection */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Select Model Tier
                </h4>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  — Choose the right balance of cost and quality
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
                {renderModelCard(
                  MODEL_CATEGORIES.find((c) => c.id === selectedCategory)!.basicModelId,
                  "basic"
                )}
                {renderModelCard(
                  MODEL_CATEGORIES.find((c) => c.id === selectedCategory)!.premiumModelId,
                  "premium"
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
