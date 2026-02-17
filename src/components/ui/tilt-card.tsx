"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  children: React.ReactNode;
}

export function TiltCard({
  glowColor = "#0088CC",
  children,
  className,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:bg-surface/80 dark:backdrop-blur-sm",
        className
      )}
      style={{
        borderColor: isHovered ? `${glowColor}60` : undefined,
        boxShadow: isHovered
          ? `0 0 20px ${glowColor}30, 0 0 40px ${glowColor}10, 0 4px 16px rgba(0,0,0,0.1)`
          : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
