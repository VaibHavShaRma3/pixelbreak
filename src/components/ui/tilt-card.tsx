"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  children: React.ReactNode;
}

export function TiltCard({
  glowColor = "#00fff5",
  children,
  className,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
    );
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform("");
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition-all duration-200",
        className
      )}
      style={{
        transform: transform || undefined,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Glow effect following cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}40, transparent 60%)`,
          }}
        />
      )}
      {/* Border glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-50"
          style={{
            boxShadow: `0 0 20px ${glowColor}30, inset 0 0 20px ${glowColor}10`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
