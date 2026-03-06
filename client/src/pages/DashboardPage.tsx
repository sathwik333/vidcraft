import { PageWrapper } from "@/components/layout/PageWrapper";
import { UsageStatsGrid } from "@/components/dashboard/UsageStats";
import { RecentGenerations } from "@/components/dashboard/RecentGenerations";
import { CreditsRemaining } from "@/components/dashboard/CreditsRemaining";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";
import { BentoGrid, BentoCard } from "@/components/animation/BentoGrid";

export default function DashboardPage() {
  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            View your recent activity, usage stats, and quick actions.
          </p>
        </ScrollReveal>

        {/* Bento Grid layout */}
        <BentoGrid className="gap-6">
          {/* Usage stats - full width */}
          <BentoCard colSpan={4} className="p-0 border-none bg-transparent backdrop-blur-none">
            <ScrollReveal delay={0.1}>
              <UsageStatsGrid />
            </ScrollReveal>
          </BentoCard>

          {/* Credits + Quick Actions — side by side */}
          <BentoCard colSpan={2} className="p-0 border-none bg-transparent backdrop-blur-none">
            <ScrollReveal delay={0.2}>
              <TiltCard tiltAmount={4} className="h-full">
                <CreditsRemaining />
              </TiltCard>
            </ScrollReveal>
          </BentoCard>

          <BentoCard colSpan={2} className="p-0 border-none bg-transparent backdrop-blur-none">
            <ScrollReveal delay={0.3}>
              <TiltCard tiltAmount={4} className="h-full">
                <QuickActions />
              </TiltCard>
            </ScrollReveal>
          </BentoCard>

          {/* Recent generations - full width */}
          <BentoCard colSpan={4} className="p-0 border-none bg-transparent backdrop-blur-none">
            <ScrollReveal delay={0.4}>
              <RecentGenerations />
            </ScrollReveal>
          </BentoCard>
        </BentoGrid>
      </div>
    </PageWrapper>
  );
}
