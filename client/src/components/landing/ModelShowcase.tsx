import {
  Film,
  Clock,
  MonitorPlay,
  Ratio,
  Check,
  Clapperboard,
  Palette,
  Cloud,
} from "lucide-react";
import {
  SiGoogle,
  SiKuaishou,
  SiOpenai,
  SiX,
  SiBytedance
} from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { MODELS } from "@/lib/constants";
import { ScrollReveal, ScrollRevealItem } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";

const modelMeta: Record<
  string,
  {
    icon: React.ElementType;
    features: string[];
    color: string;
  }
> = {
  "veo-3.1": {
    icon: SiGoogle,
    features: ["Audio output", "Native 1080p", "3 aspect ratios", "Up to 10s"],
    color: "text-emerald-400",
  },
  "kling-2.1": {
    icon: SiKuaishou,
    features: ["Consistent motion", "Versatile styles", "3 aspect ratios", "Up to 10s"],
    color: "text-purple-400",
  },
  "kling-2.5-turbo": {
    icon: SiKuaishou,
    features: ["Turbo speed", "Negative prompts", "3 aspect ratios", "5s clips"],
    color: "text-orange-400",
  },
  "kling-3.0": {
    icon: SiKuaishou,
    features: ["Sound effects", "Multi-shot stories", "Element references", "Up to 15s"],
    color: "text-gold-400",
  },
  "hailuo-2.3": {
    icon: Clapperboard,
    features: ["Expressive characters", "Cinematic motion", "768p quality", "6s clips"],
    color: "text-rose-400",
  },
  "wan-2.6": {
    icon: Cloud,
    features: ["1080p affordable", "Character consistency", "Natural motion", "5s clips"],
    color: "text-teal-400",
  },
  "bytedance-seedance": {
    icon: SiBytedance,
    features: ["Fast generation", "Scene cuts", "Camera control", "5s clips"],
    color: "text-cyan-400",
  },
  "grok-imagine": {
    icon: SiX,
    features: ["Synced audio", "xAI model", "Coherent motion", "Up to 10s"],
    color: "text-indigo-400",
  },
  "runway-gen4-turbo": {
    icon: Film,
    features: ["Cinematic quality", "Fast turnaround", "4 aspect ratios", "Up to 10s"],
    color: "text-blue-400",
  },
  "runway-aleph": {
    icon: Palette,
    features: ["In-context editing", "Style control", "5 aspect ratios", "Up to 10s"],
    color: "text-pink-400",
  },
  "sora-2": {
    icon: SiOpenai,
    features: ["Premium quality", "Up to 20s duration", "3 aspect ratios", "Priority queue"],
    color: "text-amber-400",
  },
};

const badgeStyles: Record<string, string> = {
  Starter: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Popular: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Premium: "bg-gold-500/10 text-gold-400 border-gold-500/20",
};

export default function ModelShowcase() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(220,20%,3.5%)]/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Powered by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Leading AI Models
            </span>
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Choose from eleven world-class AI video generation models, each
            with unique strengths
          </p>
        </ScrollReveal>

        {/* Model cards grid */}
        <ScrollReveal stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODELS.map((model) => {
            const meta = modelMeta[model.id];
            const IconComp = meta?.icon ?? Film;

            return (
              <ScrollRevealItem key={model.id} className="group relative">
                <TiltCard tiltAmount={6} glare className="h-full">
                  {/* Hover glow */}
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/20 group-hover:to-gold-600/10 transition-all duration-500 blur-sm opacity-0 group-hover:opacity-100" />

                  <div className="relative glass-card p-6 h-full flex flex-col group-hover:border-gold-500/20 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${meta?.color ?? "text-gold-400"}`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      {model.badge && (
                        <Badge
                          className={badgeStyles[model.badge] ?? "bg-white/5 text-white/60"}
                        >
                          {model.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Model name & description */}
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">
                      {model.name}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
                      {model.description}
                    </p>

                    {/* Info chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <div className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-white/5 rounded-md px-2 py-1">
                        <Clock className="h-3 w-3" />
                        {model.durations.join("/")}s
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-white/5 rounded-md px-2 py-1">
                        <Ratio className="h-3 w-3" />
                        {model.aspectRatios.length} ratios
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] bg-white/5 rounded-md px-2 py-1">
                        <MonitorPlay className="h-3 w-3" />
                        {model.tier}
                      </div>
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2 mt-auto">
                      {meta?.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                        >
                          <Check className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
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
