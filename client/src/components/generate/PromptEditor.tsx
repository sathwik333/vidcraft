import { useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { STYLE_PROMPTS } from "@/lib/prompts";

const MAX_CHARS = 2000;

export function PromptEditor() {
  const { prompt, selectedStyle, setPrompt } = useGenerationStore();

  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charPercentage = Math.min((charCount / MAX_CHARS) * 100, 100);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    [setPrompt]
  );

  const handleReset = useCallback(() => {
    if (selectedStyle && STYLE_PROMPTS[selectedStyle] !== undefined) {
      setPrompt(STYLE_PROMPTS[selectedStyle]);
    } else {
      setPrompt("");
    }
  }, [selectedStyle, setPrompt]);

  const isCustomStyle = selectedStyle === "custom";
  const hasDefaultPrompt =
    selectedStyle &&
    selectedStyle !== "custom" &&
    STYLE_PROMPTS[selectedStyle] !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
          <Type className="w-4 h-4" />
          Prompt
        </Label>
        {hasDefaultPrompt && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-gold-500 h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Default
          </Button>
        )}
      </div>

      <div className="relative">
        <Textarea
          value={prompt}
          onChange={handleChange}
          placeholder={
            isCustomStyle
              ? "Describe how you want your video to look..."
              : "Your prompt has been auto-generated. Feel free to edit it."
          }
          rows={6}
          className={cn(
            "resize-y min-h-[120px] bg-[hsl(var(--card))] border-[hsl(var(--border))]",
            "focus:border-gold-500/50 focus:ring-gold-500/20",
            "placeholder:text-[hsl(var(--muted-foreground))]/60",
            isOverLimit && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          )}
        />
      </div>

      {/* Footer: helper text + character counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Describe how you want your video to look
        </p>
        <div className="flex items-center gap-2">
          {/* Mini progress indicator */}
          <div className="w-16 h-1 rounded-full bg-[hsl(var(--border))] overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isOverLimit ? "bg-red-500" : "bg-gold-500"
              )}
              animate={{ width: `${charPercentage}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span
            className={cn(
              "text-xs tabular-nums",
              isOverLimit
                ? "text-red-500 font-medium"
                : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
