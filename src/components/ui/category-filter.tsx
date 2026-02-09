"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { value: string; label: string; color: string }[];
  onChange: (selected: string | null) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  onChange,
  className,
}: CategoryFilterProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (value: string) => {
    const next = selected === value ? null : value;
    setSelected(next);
    onChange(next);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={() => {
          setSelected(null);
          onChange(null);
        }}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
          selected === null
            ? "bg-neon-cyan text-background shadow-[0_0_10px_rgba(0,255,245,0.3)]"
            : "border border-border text-muted hover:border-neon-cyan/50 hover:text-foreground"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleClick(cat.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
            selected === cat.value
              ? "text-background shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              : "border border-border text-muted hover:text-foreground"
          )}
          style={
            selected === cat.value
              ? {
                  backgroundColor: cat.color,
                  boxShadow: `0 0 12px ${cat.color}50`,
                }
              : {
                  borderColor: selected === cat.value ? cat.color : undefined,
                }
          }
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
