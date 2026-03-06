import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { TIERS } from "@/lib/constants";

export function CreditsRemaining() {
  const { credits, tier, isLoading } = useCredits();
  const navigate = useNavigate();

  const currentTier = TIERS.find((t) => t.id === tier) ?? TIERS[0];
  const tierCredits = currentTier.credits ?? 100;
  // If user has more credits than tier allows (bonuses, purchases), use actual balance as max
  const maxCredits = Math.max(tierCredits, credits);
  const percentage = maxCredits > 0 ? Math.min((credits / maxCredits) * 100, 100) : 0;
  const isFree = tier === "free";

  // SVG circle calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass rounded-xl border border-[hsl(var(--border))] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Credits</h2>
        <Badge
          variant="outline"
          className="border-gold-500/30 bg-gold-500/10 text-gold-500 capitalize"
        >
          {currentTier.name}
        </Badge>
      </div>

      {/* Circular progress indicator */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className="text-gold-500"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: isLoading ? circumference : strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Coins className="h-5 w-5 text-gold-500 mb-1" />
            {isLoading ? (
              <div className="h-8 w-12 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
            ) : (
              <>
                <span className="text-2xl font-bold">{credits}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  credits
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar (horizontal alternative) */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
            <span>Remaining</span>
            <span>
              {isLoading ? "..." : `${credits} credits`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--border))]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-amber-400"
              initial={{ width: "0%" }}
              animate={{ width: isLoading ? "0%" : `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            />
          </div>
        </div>

        {isFree && (
          <Button
            onClick={() => navigate("/pricing")}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
      </div>
    </motion.div>
  );
}
