import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  /** Speed multiplier: 0 = static, 0.5 = half scroll speed, 1 = match scroll */
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function ParallaxSection({
  children,
  className,
  speed = 0.3,
  direction = "vertical",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 100 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const x = useTransform(scrollYProgress, [0, 1], [range, -range]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={direction === "vertical" ? { y } : { x }}
      >
        {children}
      </motion.div>
    </div>
  );
}
