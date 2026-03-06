import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Crown, Sparkles, Zap, Building2, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TIERS, MODELS } from "@/lib/constants";
import api from "@/lib/api";
import { ScrollReveal, ScrollRevealItem } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";

const tierIcons: Record<string, React.ReactNode> = {
  free: <Sparkles className="h-6 w-6" />,
  basic: <Zap className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
};

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleCheckout = async (planId: string) => {
    if (!isSignedIn) {
      navigate("/sign-up");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data } = await api.post("/stripe/checkout", { plan: planId });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Checkout failed:", err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <PageWrapper>
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <ScrollReveal className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Start free with 1 video. Upgrade when you need more.
            </p>

            {/* Annual/Monthly toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span
                className={cn(
                  "text-sm font-medium",
                  !annual
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  annual ? "bg-gold-500" : "bg-[hsl(var(--muted))]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                    annual ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  annual
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                Annual
                <Badge variant="secondary" className="ml-2 text-xs bg-gold-500/10 text-gold-500">
                  Save 20%
                </Badge>
              </span>
            </div>
          </ScrollReveal>

          {/* Tier Cards */}
          <ScrollReveal stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => {
              const isRecommended = tier.id === "pro";
              const monthlyPrice = tier.price;
              const displayPrice = monthlyPrice
                ? annual
                  ? Math.round(monthlyPrice * 0.8)
                  : monthlyPrice
                : null;

              return (
                <ScrollRevealItem key={tier.id} className="relative">
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gold-500 text-white">Recommended</Badge>
                    </div>
                  )}

                  <TiltCard tiltAmount={6} glare className="h-full">
                    <div
                      className={cn(
                        "glass-card p-6 h-full flex flex-col",
                        isRecommended && "border-gold-500/50 shadow-lg shadow-gold-500/10 ring-1 ring-gold-500/20"
                      )}
                    >
                      <div className="flex items-center gap-2 text-gold-500 mb-4">
                        {tierIcons[tier.id]}
                        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                          {tier.name}
                        </h3>
                      </div>

                      <div className="mb-6">
                        {displayPrice !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">${displayPrice}</span>
                            <span className="text-[hsl(var(--muted-foreground))]">/mo</span>
                          </div>
                        ) : tier.id === "free" ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-[hsl(var(--muted-foreground))]">forever</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold">Custom</div>
                        )}
                        {tier.credits && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                            {tier.credits} {tier.credits === 1 ? "video" : "videos"}/month
                          </p>
                        )}
                      </div>

                      <Separator className="mb-6" />

                      <ul className="space-y-3 flex-1 mb-6">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className={cn("h-4 w-4 shrink-0 mt-0.5", isRecommended ? "text-gold-500" : "text-gold-500/60")} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        {tier.id === "free" ? (
                          <Link to="/sign-up">
                            <MagneticButton className="w-full">
                              <Button variant="outline" className="w-full">
                                Start Free
                              </Button>
                            </MagneticButton>
                          </Link>
                        ) : tier.id === "enterprise" ? (
                          <MagneticButton className="w-full">
                            <Button variant="outline" className="w-full">
                              Contact Us
                            </Button>
                          </MagneticButton>
                        ) : isRecommended ? (
                          <MagneticButton className="w-full">
                            <GlowButton
                              className="w-full bg-gold-500 hover:bg-gold-600 text-white"
                              disabled={loadingPlan === tier.id}
                              onClick={() => handleCheckout(tier.id)}
                            >
                              {loadingPlan === tier.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Redirecting...
                                </>
                              ) : isSignedIn ? (
                                `Get ${tier.name}`
                              ) : (
                                `Sign up for ${tier.name}`
                              )}
                            </GlowButton>
                          </MagneticButton>
                        ) : (
                          <MagneticButton className="w-full">
                            <Button
                              className="w-full"
                              disabled={loadingPlan === tier.id}
                              onClick={() => handleCheckout(tier.id)}
                            >
                              {loadingPlan === tier.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Redirecting...
                                </>
                              ) : isSignedIn ? (
                                `Get ${tier.name}`
                              ) : (
                                `Sign up for ${tier.name}`
                              )}
                            </Button>
                          </MagneticButton>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </ScrollRevealItem>
              );
            })}
          </ScrollReveal>

          {/* Model Cost Table */}
          <ScrollReveal delay={0.3} className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">
              Cost Per Video by Model
            </h2>
            <div className="overflow-x-auto glass-card p-4">
              <table className="w-full max-w-3xl mx-auto text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-3 px-4 font-semibold">Model</th>
                    <th className="text-center py-3 px-4 font-semibold">5s</th>
                    <th className="text-center py-3 px-4 font-semibold">8s</th>
                    <th className="text-center py-3 px-4 font-semibold">10s</th>
                    <th className="text-center py-3 px-4 font-semibold">15s</th>
                    <th className="text-center py-3 px-4 font-semibold">20s</th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((model) => (
                    <tr
                      key={model.id}
                      className="border-b border-[hsl(var(--border))]/50 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {model.name}
                        {model.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {model.badge}
                          </Badge>
                        )}
                      </td>
                      {[5, 8, 10, 15, 20].map((dur) => (
                        <td key={dur} className="text-center py-3 px-4">
                          {model.creditCost[dur] !== undefined ? (
                            <span className="text-gold-500 font-medium">
                              {model.creditCost[dur]} cr
                            </span>
                          ) : (
                            <span className="text-[hsl(var(--muted-foreground))]">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4">
              1 credit = 1 basic video generation. Higher quality models and longer durations cost more credits.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </PageWrapper>
  );
}
