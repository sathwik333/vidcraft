import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RefreshCw,
    Coins,
    ArrowDownCircle,
    ArrowUpCircle,
    Gift,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Receipt,
    Loader2,
    Calendar,
    TrendingDown,
    CreditCard,
    Zap,
    Sparkles,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCredits } from "@/hooks/useCredits";
import { TIERS } from "@/lib/constants";
import api from "@/lib/api";
import { format } from "date-fns";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";
import { BentoGrid, BentoCard } from "@/components/animation/BentoGrid";

interface Transaction {
    id: string;
    amount: number;
    balance_after: number;
    type: "deduction" | "purchase" | "bonus" | "refund";
    description: string;
    generation_id: string | null;
    created_at: string;
}

const typeConfig: Record<
    string,
    { label: string; icon: React.ElementType; color: string; badgeClass: string }
> = {
    deduction: {
        label: "Used",
        icon: ArrowDownCircle,
        color: "text-red-400",
        badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    purchase: {
        label: "Purchase",
        icon: ArrowUpCircle,
        color: "text-emerald-400",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    bonus: {
        label: "Bonus",
        icon: Gift,
        color: "text-gold-400",
        badgeClass: "bg-gold-500/10 text-gold-400 border-gold-500/20",
    },
    refund: {
        label: "Refund",
        icon: RotateCcw,
        color: "text-blue-400",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
};

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
    const { credits, tier, isLoading: creditsLoading, refetch: refetchCredits } = useCredits();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const currentTier = TIERS.find((t) => t.id === tier) ?? TIERS[0];

    const handleBuyCredits = async (plan: string) => {
        setLoadingPlan(plan);
        try {
            const { data } = await api.post("/stripe/checkout", { plan });
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setLoadingPlan(null);
        }
    };
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const fetchTransactions = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/credits/transactions", {
                params: { page: pageNum, limit: ITEMS_PER_PAGE },
            });
            setTransactions(data.transactions);
            setTotal(data.total);
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions(page);
    }, [page, fetchTransactions]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchTransactions(page), refetchCredits()]);
        setIsRefreshing(false);
    };

    return (
        <PageWrapper>
            <div className="space-y-6 p-6">
                {/* Page header */}
                <ScrollReveal>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payments & Usage</h1>
                            <p className="text-[hsl(var(--muted-foreground))] mt-2">
                                Track your credit usage, transactions, and billing history.
                            </p>
                        </div>
                        <MagneticButton>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </MagneticButton>
                    </div>
                </ScrollReveal>

                {/* Overview cards — bento grid */}
                <BentoGrid className="lg:grid-cols-3 gap-4">
                    {/* Current Balance */}
                    <BentoCard className="p-0 border-none bg-transparent backdrop-blur-none">
                        <ScrollReveal delay={0.1}>
                            <TiltCard tiltAmount={6}>
                                <Card className="glass-card border-[hsl(var(--border))]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                                                <Coins className="h-5 w-5 text-gold-500" />
                                            </div>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Current Balance
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            {creditsLoading ? (
                                                <div className="h-8 w-16 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-gold-500">{credits}</span>
                                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">credits</span>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TiltCard>
                        </ScrollReveal>
                    </BentoCard>

                    {/* Current Plan */}
                    <BentoCard className="p-0 border-none bg-transparent backdrop-blur-none">
                        <ScrollReveal delay={0.15}>
                            <TiltCard tiltAmount={6}>
                                <Card className="glass-card border-[hsl(var(--border))]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Receipt className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Current Plan
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold capitalize">{currentTier.name}</span>
                                            {currentTier.price !== null && currentTier.price > 0 && (
                                                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    ${currentTier.price}/mo
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TiltCard>
                        </ScrollReveal>
                    </BentoCard>

                    {/* Total Transactions */}
                    <BentoCard className="p-0 border-none bg-transparent backdrop-blur-none">
                        <ScrollReveal delay={0.2}>
                            <TiltCard tiltAmount={6}>
                                <Card className="glass-card border-[hsl(var(--border))]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                <TrendingDown className="h-5 w-5 text-red-400" />
                                            </div>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Total Transactions
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            {isLoading ? (
                                                <div className="h-8 w-16 animate-pulse rounded bg-[hsl(var(--muted-foreground))]/10" />
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold">{total}</span>
                                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">total</span>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TiltCard>
                        </ScrollReveal>
                    </BentoCard>
                </BentoGrid>

                {/* Buy Credits */}
                <ScrollReveal delay={0.25}>
                    <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TiltCard tiltAmount={4}>
                            <Card className="glass-card border-[hsl(var(--border))] hover:border-gold-500/30 transition-colors">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-gold-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[hsl(var(--foreground))]">Basic Pack</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">10 credits</p>
                                        </div>
                                    </div>
                                    <MagneticButton>
                                        <Button
                                            onClick={() => handleBuyCredits("basic")}
                                            disabled={!!loadingPlan}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            {loadingPlan === "basic" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CreditCard className="h-4 w-4" />
                                            )}
                                            $10
                                        </Button>
                                    </MagneticButton>
                                </CardContent>
                            </Card>
                        </TiltCard>
                        <TiltCard tiltAmount={4}>
                            <Card className="glass-card border-gold-500/30 ring-1 ring-gold-500/10 hover:ring-gold-500/20 transition-all">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center">
                                            <Sparkles className="h-6 w-6 text-gold-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[hsl(var(--foreground))]">Pro Pack</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">30 credits</p>
                                        </div>
                                    </div>
                                    <MagneticButton>
                                        <GlowButton
                                            onClick={() => handleBuyCredits("pro")}
                                            disabled={!!loadingPlan}
                                            className="bg-gold-500 hover:bg-gold-600 text-white"
                                        >
                                            {loadingPlan === "pro" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CreditCard className="h-4 w-4" />
                                            )}
                                            $25
                                        </GlowButton>
                                    </MagneticButton>
                                </CardContent>
                            </Card>
                        </TiltCard>
                    </div>
                </ScrollReveal>

                {/* Transaction History */}
                <ScrollReveal delay={0.3}>
                    <Card className="glass-card border-[hsl(var(--border))]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Transaction History</h2>
                                <Badge variant="outline" className="text-xs">
                                    {total} total
                                </Badge>
                            </div>

                            {/* Table */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
                                    <Receipt className="h-10 w-10 mb-3 opacity-40" />
                                    <p className="text-sm font-medium">No transactions yet</p>
                                    <p className="text-xs mt-1">
                                        Your credit transactions will appear here.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-[hsl(var(--border))]">
                                                    <th className="text-left py-3 px-4 font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                    <th className="text-left py-3 px-4 font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="text-left py-3 px-4 font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="text-right py-3 px-4 font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
                                                        Credits
                                                    </th>
                                                    <th className="text-right py-3 px-4 font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
                                                        Balance
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <AnimatePresence mode="wait">
                                                    {transactions.map((tx, index) => {
                                                        const config = typeConfig[tx.type] ?? typeConfig.deduction;
                                                        const TypeIcon = config.icon;

                                                        return (
                                                            <motion.tr
                                                                key={tx.id}
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ delay: index * 0.03 }}
                                                                className="border-b border-[hsl(var(--border))]/50 hover:bg-white/[0.02] transition-colors"
                                                            >
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                                                                        <span className="text-[hsl(var(--foreground))]">
                                                                            {format(new Date(tx.created_at), "MMM d, yyyy")}
                                                                        </span>
                                                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                            {format(new Date(tx.created_at), "h:mm a")}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <Badge className={`${config.badgeClass} gap-1`}>
                                                                        <TypeIcon className="h-3 w-3" />
                                                                        {config.label}
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-3 px-4 text-[hsl(var(--foreground))]">
                                                                    {tx.description}
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-mono font-semibold">
                                                                    <span className={tx.amount < 0 ? "text-red-400" : "text-emerald-400"}>
                                                                        {tx.amount > 0 ? "+" : ""}
                                                                        {tx.amount}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-mono text-[hsl(var(--muted-foreground))]">
                                                                    {tx.balance_after}
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    Page {page} of {totalPages} • Showing{" "}
                                                    {(page - 1) * ITEMS_PER_PAGE + 1}–
                                                    {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <MagneticButton>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                            disabled={page <= 1}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                    </MagneticButton>
                                                    <MagneticButton>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                            disabled={page >= totalPages}
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </MagneticButton>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
        </PageWrapper>
    );
}
