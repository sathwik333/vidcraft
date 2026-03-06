import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  /** If true, staggers children (wrap each child in ScrollRevealItem) */
  stagger?: number;
}

const getInitial = (direction: string, distance = 40) => {
  switch (direction) {
    case "up": return { opacity: 0, y: distance };
    case "down": return { opacity: 0, y: -distance };
    case "left": return { opacity: 0, x: distance };
    case "right": return { opacity: 0, x: -distance };
    default: return { opacity: 0, y: distance };
  }
};

const getAnimate = (direction: string) => {
  switch (direction) {
    case "up":
    case "down": return { opacity: 1, y: 0 };
    case "left":
    case "right": return { opacity: 1, x: 0 };
    default: return { opacity: 1, y: 0 };
  }
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  className,
  stagger,
}: ScrollRevealProps) {
  if (stagger !== undefined) {
    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    };

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-80px" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={getInitial(direction)}
      whileInView={getAnimate(direction)}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Use as direct child of a staggered ScrollReveal */
export function ScrollRevealItem({
  children,
  className,
  direction = "up",
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}) {
  const itemVariants: Variants = {
    hidden: getInitial(direction),
    visible: {
      ...getAnimate(direction),
      transition: { duration, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
