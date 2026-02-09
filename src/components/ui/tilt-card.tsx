"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  children: React.ReactNode;
}

export function TiltCard({
  glowColor = "#1D4ED8",
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
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Subtle top border accent on hover */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 transition-opacity"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
