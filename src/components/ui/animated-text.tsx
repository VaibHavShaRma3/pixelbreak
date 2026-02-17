"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent animate-gradient-shift",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #00FFF5, #FF2D95, #39FF14, #B026FF, #00FFF5)",
        backgroundSize: "300% 100%",
        animation: "gradient-shift 4s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className }: GlitchTextProps) {
  return (
    <span className={cn("glitch-text relative inline-block", className)} data-text={children}>
      {children}
    </span>
  );
}
