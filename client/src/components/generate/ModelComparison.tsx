import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, AlertTriangle, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { MODELS } from "@/lib/constants";

export function ModelComparison() {
  const {
    comparisonEnabled,
    comparisonModels,
    duration,
    resultVideoUrl,
    status,
    setComparisonEnabled,
    toggleComparisonModel,
  } = useGenerationStore();

  const totalCost = useMemo(() => {
    return comparisonModels.reduce((total, modelId) => {
      const model = MODELS.find((m) => m.id === modelId);
      if (!model) return total;
      return total + (model.creditCost[duration] ?? 0);
    }, 0);
  }, [comparisonModels, duration]);

  const hasResults = status === "completed" && resultVideoUrl;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] cursor-pointer">
          <GitCompareArrows className="w-4 h-4" />
          Compare Models
        </Label>
        <Switch
          checked={comparisonEnabled}
          onCheckedChange={setComparisonEnabled}
        />
      </div>

      <AnimatePresence>
        {comparisonEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden space-y-4"
          >
            {/* Model selection checkboxes */}
            <div className="space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Select 2-4 models to compare side by side
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MODELS.map((model) => {
                  const isChecked = comparisonModels.includes(model.id);
                  const isMaxReached =
                    comparisonModels.length >= 4 && !isChecked;

                  return (
                    <button
                      key={model.id}
                      onClick={() => !isMaxReached && toggleComparisonModel(model.id)}
                      disabled={isMaxReached}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200",
                        isChecked
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
                        isMaxReached && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Custom checkbox */}
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                          isChecked
                            ? "bg-gold-500 border-gold-500"
                            : "border-[hsl(var(--muted-foreground))]/40"
                        )}
                      >
                        {isChecked && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 text-black"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {model.creditCost[duration] ?? "?"} credits
                        </p>
                      </div>

                      {model.badge && (
                        <Badge className="ml-auto text-[9px] shrink-0 bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))] border-none">
                          {model.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cost warning */}
            {comparisonModels.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[hsl(var(--foreground))]">
                    Comparing{" "}
                    <span className="font-semibold">{comparisonModels.length} models</span>{" "}
                    will cost{" "}
                    <span className="font-bold text-gold-500 inline-flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {totalCost} credits
                    </span>{" "}
                    total
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    Each model will generate a separate video from your photo
                  </p>
                </div>
              </motion.div>
            )}

            {comparisonModels.length > 0 && comparisonModels.length < 2 && (
              <p className="text-xs text-amber-500">
                Select at least 2 models to compare
              </p>
            )}

            {/* Results area (placeholder - visible after generation) */}
            {hasResults && comparisonModels.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Comparison Results
                </p>
                <div
                  className={cn(
                    "grid gap-3",
                    comparisonModels.length <= 2
                      ? "grid-cols-2"
                      : "grid-cols-2 lg:grid-cols-4"
                  )}
                >
                  {comparisonModels.map((modelId) => {
                    const model = MODELS.find((m) => m.id === modelId);
                    return (
                      <div
                        key={modelId}
                        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
                      >
                        <div className="aspect-video bg-black/20 flex items-center justify-center">
                          {/* Placeholder for comparison video */}
                          <video
                            src={resultVideoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="px-3 py-2 border-t border-[hsl(var(--border))]">
                          <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">
                            {model?.name ?? modelId}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
