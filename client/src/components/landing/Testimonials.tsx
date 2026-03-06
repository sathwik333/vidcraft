import { Star } from "lucide-react";
import { ScrollReveal, ScrollRevealItem } from "@/components/animation/ScrollReveal";
import { TiltCard } from "@/components/animation/TiltCard";

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  rating: number;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "E-commerce Store Owner",
    initials: "SC",
    rating: 5,
    quote:
      "VidCraft completely transformed how I create product listings. I used to spend $500+ per product video with a freelancer. Now I generate scroll-stopping videos in under a minute. My conversion rate jumped 34% in the first month.",
  },
  {
    name: "Marcus Rivera",
    role: "Social Media Marketer",
    initials: "MR",
    rating: 5,
    quote:
      "The Runway Gen-4 model produces cinematic quality that my clients love. I manage 12 brand accounts and VidCraft lets me produce a week's worth of video content in an afternoon. It's an absolute game changer.",
  },
  {
    name: "Emily Tanaka",
    role: "Creative Director, BrightLoop Agency",
    initials: "ET",
    rating: 5,
    quote:
      "We've tried every AI video tool out there. VidCraft is the first one where the output actually looks professional enough to present to clients. The style presets save us hours of prompt engineering. Highly recommended.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(220,20%,3.5%)]/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Creators
            </span>
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            See what professionals are saying about VidCraft
          </p>
        </ScrollReveal>

        {/* Testimonial cards */}
        <ScrollReveal stagger={0.15} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <ScrollRevealItem key={testimonial.name}>
              <TiltCard tiltAmount={6} glare className="h-full">
                <div className="glass-card p-6 flex flex-col h-full hover:border-gold-500/20 transition-all duration-300">
                  {/* Star rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-gold-400 fill-gold-400"
                            : "text-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1 mb-6">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    {/* Avatar with initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-gold-400">
                        {testimonial.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
