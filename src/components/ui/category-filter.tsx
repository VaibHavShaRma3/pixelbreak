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
            ? "bg-accent-primary text-white shadow-sm"
            : "border border-border text-muted hover:border-accent-primary/50 hover:text-foreground"
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
              ? "text-white shadow-sm"
              : "border border-border text-muted hover:text-foreground"
          )}
          style={
            selected === cat.value
              ? { backgroundColor: cat.color }
              : undefined
          }
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
