import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { MODELS } from "@/lib/constants";
import { STYLE_PROMPTS } from "@/lib/prompts";

interface GenerateButtonProps {
  onGenerate: () => void;
}

export function GenerateButton({ onGenerate }: GenerateButtonProps) {
  const {
    uploadedFile,
    selectedModel,
    selectedStyle,
    prompt,
    duration,
    status,
  } = useGenerationStore();

  // "showConfirmation" becomes true ONLY after the user clicks Generate without editing the prompt
  const [showConfirmation, setShowConfirmation] = useState(false);
  const userHasEditedPrompt = useRef(false);

  // Detect if the current prompt matches the default for the selected style
  const isDefaultPrompt = useMemo(() => {
    if (!selectedStyle || selectedStyle === "custom") return false;
    const defaultPrompt = STYLE_PROMPTS[selectedStyle];
    return defaultPrompt !== undefined && prompt === defaultPrompt;
  }, [selectedStyle, prompt]);

  // When the style changes, reset everything
  useEffect(() => {
    setShowConfirmation(false);
    userHasEditedPrompt.current = false;
  }, [selectedStyle]);

  // Track if the user manually edits the prompt away from the default
  const prevPromptRef = useRef(prompt);
  useEffect(() => {
    if (prevPromptRef.current !== prompt && !isDefaultPrompt) {
      userHasEditedPrompt.current = true;
      setShowConfirmation(false); // hide nudge if they edit
    }
    prevPromptRef.current = prompt;
  }, [prompt, isDefaultPrompt]);

  const isGenerating =
    status === "uploading" || status === "generating" || status === "polling";

  const isDisabled =
    !uploadedFile ||
    !selectedModel ||
    !selectedStyle ||
    !prompt.trim() ||
    isGenerating;

  const creditCost = useMemo(() => {
    const model = MODELS.find((m) => m.id === selectedModel);
    if (!model) return 0;
    return model.creditCost[duration] ?? 0;
  }, [selectedModel, duration]);

  const handleClick = () => {
    if (isDisabled) return;

    // If prompt is still the default and user hasn't edited it, show confirmation
    if (isDefaultPrompt && !userHasEditedPrompt.current && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Either they confirmed, or they edited the prompt — proceed
    setShowConfirmation(false);
    onGenerate();
  };

  return (
    <div className="space-y-2">
      {/* Nudge banner — only appears AFTER user clicked Generate without editing */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-xs">
                <span className="font-semibold">Are you sure you want to go ahead with this prompt?</span>{" "}
                Review the prompt above, then click Generate again to proceed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileTap={!isDisabled ? { scale: 0.98 } : undefined}>
        <Button
          onClick={handleClick}
          disabled={isDisabled}
          size="lg"
          className={cn(
            "w-full h-14 text-base font-semibold rounded-xl transition-all duration-200",
            showConfirmation
              ? "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_4px_20px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_30px_-5px_rgba(245,158,11,0.5)]"
              : "bg-gold-500 hover:bg-gold-600 text-black shadow-[0_4px_20px_-5px_hsl(45,93%,47%,0.4)] hover:shadow-[0_6px_30px_-5px_hsl(45,93%,47%,0.5)]",
            "disabled:bg-gold-500/30 disabled:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </div>
          ) : showConfirmation ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>
                Yes, Generate Video
                {creditCost > 0 && ` (${creditCost} Credit${creditCost !== 1 ? "s" : ""})`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>
                Generate Video
                {creditCost > 0 && ` (${creditCost} Credit${creditCost !== 1 ? "s" : ""})`}
              </span>
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

