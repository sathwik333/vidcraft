import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";
import { ParallaxSection } from "@/components/animation/ParallaxSection";

export function CTAFooter() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400" />

      {/* Animated background pattern — parallax */}
      <ParallaxSection speed={0.2} className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </ParallaxSection>

      <div className="relative mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Create Amazing Videos?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Start with 1 free video. No credit card required.
            </p>
            <div className="flex justify-center pt-4">
              <MagneticButton>
                <Link to="/sign-up">
                  <GlowButton
                    className="bg-white text-gold-600 hover:bg-white/90 font-semibold text-lg px-8 py-4"
                    glowColor="rgba(255, 255, 255, 0.3)"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </GlowButton>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
