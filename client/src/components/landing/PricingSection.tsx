import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { ScrollReveal, ScrollRevealItem } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";

export default function PricingSection() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!isSignedIn) {
      navigate("/sign-up");
      return;
    }

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

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/[0.02] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </ScrollReveal>

        {/* Pricing cards */}
        <ScrollReveal stagger={0.12} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const isPro = tier.id === "pro";
            const isLoading = loadingPlan === tier.id;

            return (
              <ScrollRevealItem key={tier.id} className="relative">
                {/* Recommended badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gold-500 text-white border-gold-500 hover:bg-gold-500 px-3 py-1">
                      Recommended
                    </Badge>
                  </div>
                )}

                <TiltCard tiltAmount={6} glare className="h-full">
                  <div
                    className={cn(
                      "glass-card p-6 h-full flex flex-col transition-all duration-300",
                      isPro
                        ? "border-gold-500/50 shadow-lg shadow-gold-500/10 ring-1 ring-gold-500/20"
                        : "hover:border-white/20"
                    )}
                  >
                    {/* Tier name */}
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                      {tier.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-4 mb-6">
                      {tier.price === null ? (
                        <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
                          Custom
                        </div>
                      ) : tier.price === 0 ? (
                        <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
                          Free
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[hsl(var(--foreground))]">
                            ${tier.price}
                          </span>
                          <span className="text-[hsl(var(--muted-foreground))] text-sm">
                            /month
                          </span>
                        </div>
                      )}
                      {tier.credits !== null && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          {tier.credits} {tier.credits === 1 ? "credit" : "credits"}/month
                        </p>
                      )}
                      {tier.credits === null && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          Unlimited credits
                        </p>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              isPro ? "text-gold-500" : "text-gold-500/60"
                            )}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-auto">
                      {tier.id === "free" ? (
                        <Link to="/sign-up">
                          <MagneticButton className="w-full">
                            <Button
                              className="w-full bg-gold-500/10 hover:bg-gold-500/20 text-gold-400"
                              variant="default"
                            >
                              Start Free
                            </Button>
                          </MagneticButton>
                        </Link>
                      ) : tier.id === "enterprise" ? (
                        <Link to="mailto:support@vidcraft.ai">
                          <MagneticButton className="w-full">
                            <Button
                              className="w-full border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-white/5"
                              variant="outline"
                            >
                              Contact Us
                            </Button>
                          </MagneticButton>
                        </Link>
                      ) : isPro ? (
                        <MagneticButton className="w-full">
                          <GlowButton
                            className="w-full bg-gold-500 hover:bg-gold-600 text-white"
                            onClick={() => handleCheckout(tier.id)}
                            disabled={isLoading || !!loadingPlan}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Redirecting...
                              </>
                            ) : (
                              `Get ${tier.name}`
                            )}
                          </GlowButton>
                        </MagneticButton>
                      ) : (
                        <MagneticButton className="w-full">
                          <Button
                            className="w-full border border-white/20 text-[hsl(var(--foreground))] hover:bg-white/5"
                            variant="ghost"
                            onClick={() => handleCheckout(tier.id)}
                            disabled={isLoading || !!loadingPlan}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Redirecting...
                              </>
                            ) : (
                              `Get ${tier.name}`
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
      </div>
    </section>
  );
}
