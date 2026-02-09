"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === "number" ? 0 : value
  );
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          if (typeof value === "number") {
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplayValue(Math.floor(eased * value));
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
