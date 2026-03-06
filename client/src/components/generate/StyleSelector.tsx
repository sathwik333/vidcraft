import { motion } from "framer-motion";
import {
  Package,
  Smartphone,
  Diamond,
  Megaphone,
  Sun,
  Gift,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { STYLES } from "@/lib/constants";
import { STYLE_PROMPTS } from "@/lib/prompts";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Package,
  Smartphone,
  Diamond,
  Megaphone,
  Sun,
  Gift,
  Pencil,
};

export function StyleSelector() {
  const { selectedStyle, setStyle, setPrompt } = useGenerationStore();

  const handleSelect = (styleId: string) => {
    setStyle(styleId);

    // Auto-populate prompt from STYLE_PROMPTS
    const prompt = STYLE_PROMPTS[styleId];
    if (prompt !== undefined) {
      setPrompt(prompt);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STYLES.map((style) => {
        const isSelected = selectedStyle === style.id;
        const Icon = iconMap[style.icon] ?? Package;

        return (
          <motion.button
            key={style.id}
            onClick={() => handleSelect(style.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative text-left rounded-xl border p-4 transition-all duration-200",
              "bg-[hsl(var(--card))] hover:bg-[hsl(var(--card))]/80",
              isSelected &&
                "border-gold-500 shadow-[0_0_20px_-5px_hsl(45,93%,47%,0.3)]",
              !isSelected && "border-[hsl(var(--border))]"
            )}
          >
            <div className="flex flex-col gap-2.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isSelected
                    ? "bg-gold-500/20 text-gold-500"
                    : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <h3
                  className={cn(
                    "font-semibold text-sm",
                    isSelected
                      ? "text-gold-500"
                      : "text-[hsl(var(--foreground))]"
                  )}
                >
                  {style.name}
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">
                  {style.description}
                </p>
              </div>
            </div>

            {/* Selected ring */}
            {isSelected && (
              <motion.div
                layoutId="style-selected-ring"
                className="absolute inset-0 rounded-xl border-2 border-gold-500 pointer-events-none"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
