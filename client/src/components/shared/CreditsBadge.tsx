import { useCredits } from "@/hooks/useCredits";
import { Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditsBadge() {
  const { credits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5">
        <Coins className="h-4 w-4 text-gold-500" />
        <Skeleton className="h-4 w-8 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 px-3 py-1.5 transition-colors hover:bg-gold-500/10">
      <Coins className="h-4 w-4 text-gold-500" />
      <span className="text-sm font-semibold text-gold-500">
        {credits}
      </span>
      <span className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:inline">
        Credits
      </span>
    </div>
  );
}
