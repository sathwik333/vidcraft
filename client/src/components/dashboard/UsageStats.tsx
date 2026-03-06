import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, Coins, Cpu } from "lucide-react";
import api from "@/lib/api";

function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));

      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration]);

  return <>{display}</>;
}

interface DashboardStats {
  totalGenerations: number;
  creditsUsedThisMonth: number;
  favoriteModel: string | null;
  recentGenerations: unknown[];
}

export function UsageStatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get<DashboardStats>("/user/dashboard-stats");
        setStats(data);
      } catch {
        // silent fail — cards will show 0
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        className="glass rounded-xl border border-[hsl(var(--border))] p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
            <Video className="h-6 w-6 text-gold-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Total Videos Generated
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
              ) : (
                <AnimatedNumber value={stats?.totalGenerations ?? 0} />
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-xl border border-[hsl(var(--border))] p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
            <Coins className="h-6 w-6 text-gold-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Credits Used This Month
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
              ) : (
                <AnimatedNumber value={stats?.creditsUsedThisMonth ?? 0} />
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-xl border border-[hsl(var(--border))] p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
            <Cpu className="h-6 w-6 text-gold-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Favorite Model
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <span className="inline-block h-7 w-24 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
              ) : (
                stats?.favoriteModel ?? "None yet"
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
