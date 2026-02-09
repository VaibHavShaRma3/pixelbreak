"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Disable in light mode
    if (theme === "light") return;

    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    // Smooth trailing glow
    const animate = () => {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
      requestAnimationFrame(animate);
    };

    const onMouseEnter = () => {
      dot.style.opacity = "1";
      glow.style.opacity = "1";
    };

    const onMouseLeave = () => {
      dot.style.opacity = "0";
      glow.style.opacity = "0";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    const frame = requestAnimationFrame(animate);

    document.body.classList.add("custom-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(frame);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [theme]);

  // Don't render cursor elements in light mode
  if (theme === "light") return null;

  return (
    <>
      {/* Small dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary opacity-0 transition-[width,height,background-color] duration-150 mix-blend-screen"
      />
      {/* Trailing glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.3), transparent 70%)",
        }}
      />
    </>
  );
}
