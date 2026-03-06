import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function GlowButton({
  children,
  className = "",
  glowColor = "rgba(245, 158, 11, 0.4)",
  onClick,
  disabled,
}: GlowButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const background = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, ${glowColor} 0%, transparent 60%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl px-8 py-3 font-semibold transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] ${className}`}
    >
      {/* Glow layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      {/* Shimmer border */}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-gold-500/20 transition-colors duration-300 hover:border-gold-500/40" />
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
