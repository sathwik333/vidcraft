import { Upload, SlidersHorizontal, Play, ArrowRight } from "lucide-react";
import { ScrollReveal, ScrollRevealItem } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description:
      "Drop in any product photo, lifestyle shot, or creative image",
    step: "01",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose Model & Style",
    description:
      "Pick from 4 AI models and 7 video styles, then fine-tune your prompt",
    step: "02",
  },
  {
    icon: Play,
    title: "Get Your Video",
    description:
      "Watch your video generate in real-time, then download in MP4, WebM, or GIF",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/[0.02] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Works
            </span>
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Three simple steps from photo to professional video
          </p>
        </ScrollReveal>

        {/* Steps */}
        <ScrollReveal stagger={0.2} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <ScrollRevealItem key={step.step} className="relative">
              {/* Connector arrow (between cards, hidden on last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 lg:-right-5 z-20 -translate-y-1/2">
                  <ArrowRight className="h-5 w-5 text-gold-500/40" />
                </div>
              )}

              <TiltCard tiltAmount={8} glare className="h-full">
                <div className="glass-card p-8 h-full group hover:border-gold-500/30 transition-all duration-300">
                  {/* Step number */}
                  <div className="text-5xl font-bold text-gold-500/10 mb-4">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center mb-5 group-hover:bg-gold-500/20 transition-colors">
                    <step.icon className="h-7 w-7 text-gold-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </TiltCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
