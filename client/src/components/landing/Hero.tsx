import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Play, Zap, Film, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/animation/TiltCard";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { GlowButton } from "@/components/animation/GlowButton";
import { ParallaxSection } from "@/components/animation/ParallaxSection";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

const stats = [
  { icon: Zap, label: "4 AI Models", value: "4" },
  { icon: Film, label: "7 Video Styles", value: "7" },
  { icon: Clock, label: "10s to Generate", value: "10s" },
];

export default function Hero() {
  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,3.5%)] via-[hsl(220,20%,6%)] to-[hsl(220,20%,3.5%)]" />

      {/* Gold accent orbs — parallax */}
      <ParallaxSection speed={0.3} className="absolute top-1/4 left-1/4">
        <div className="w-96 h-96 bg-gold-500/10 rounded-full blur-[128px]" />
      </ParallaxSection>
      <ParallaxSection speed={0.5} className="absolute bottom-1/4 right-1/4">
        <div className="w-72 h-72 bg-gold-400/8 rounded-full blur-[96px]" />
      </ParallaxSection>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-gold-400 text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Video Generation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              Transform Photos into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                Stunning Videos
              </span>{" "}
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto lg:mx-0"
            >
              Powered by the world's best AI models. Create professional product
              videos, social media content, and more in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <MagneticButton>
                <Link to="/sign-up">
                  <GlowButton className="bg-gold-500 hover:bg-gold-600 text-white h-12 text-base">
                    Get Started Free
                    <Sparkles className="h-4 w-4" />
                  </GlowButton>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToHowItWorks}
                  className="h-12 text-base border-white/10 text-white hover:bg-white/5"
                >
                  <Play className="mr-2 h-4 w-4" />
                  See How It Works
                </Button>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Right column - Floating visual mockup with TiltCard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <motion.div animate={floatingAnimation} className="relative">
              <TiltCard tiltAmount={6} glare className="relative">
                {/* Main card mockup */}
                <div className="relative w-80 h-80 glass-card p-6 shadow-2xl shadow-gold-500/10">
                  {/* Simulated image area */}
                  <div className="w-full h-40 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-700/10 flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gold-500/30 flex items-center justify-center">
                      <Play className="h-8 w-8 text-gold-400 ml-1" />
                    </div>
                  </div>
                  {/* Simulated progress bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Generating video...
                      </span>
                      <span className="text-gold-400 font-medium">87%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10">
                      <div className="w-[87%] h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-medium">
                        Runway Gen-4
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 text-[hsl(var(--muted-foreground))] text-xs">
                        16:9
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 text-[hsl(var(--muted-foreground))] text-xs">
                        10s
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Floating secondary card */}
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                    delay: 1,
                  },
                }}
                className="absolute -bottom-6 -left-12 glass-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Complete!</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Video ready to download
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating tertiary card */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                    delay: 2,
                  },
                }}
                className="absolute -top-4 -right-8 glass-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                    <Film className="h-4 w-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">4 Models</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Choose your style
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar with TiltCards */}
        <ScrollReveal delay={0.7} className="mt-20">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <TiltCard tiltAmount={10} className="h-full">
                  <div className="glass-card p-4 text-center h-full">
                    <stat.icon className="h-5 w-5 text-gold-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {stat.label}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
