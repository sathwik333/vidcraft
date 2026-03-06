import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Number of columns to span */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows to span */
  rowSpan?: 1 | 2;
}

const colSpanMap = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
  4: "sm:col-span-2 lg:col-span-4",
};

const rowSpanMap = {
  1: "",
  2: "row-span-2",
};

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6",
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}
