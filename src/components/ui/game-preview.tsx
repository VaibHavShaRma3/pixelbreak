"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";

interface GamePreviewProps {
  slug: string;
  color: string;
}

// Animated preview that shows on card hover — unique per game type
export function GamePreview({ slug, color }: GamePreviewProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg">
      {slug === "bubble-wrap" && <BubblePreview color={color} />}
      {slug === "color-match" && <ColorPreview />}
      {slug === "stack" && <StackPreview color={color} />}
      {slug === "sudoku-lite" && <SudokuPreview color={color} />}
      {!["bubble-wrap", "color-match", "stack", "sudoku-lite"].includes(slug) && (
        <Gamepad2 className="h-12 w-12" style={{ color }} />
      )}
    </div>
  );
}

function BubblePreview({ color }: { color: string }) {
  const [popped, setPopped] = useState<Set<number>>(new Set());

  return (
    <div className="grid grid-cols-5 gap-1 p-3">
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="aspect-square rounded-full border transition-all duration-200"
          style={{
            borderColor: popped.has(i) ? "transparent" : `${color}60`,
            backgroundColor: popped.has(i) ? "transparent" : `${color}15`,
            transform: popped.has(i) ? "scale(0.5)" : "scale(1)",
            opacity: popped.has(i) ? 0.2 : 1,
          }}
          onMouseEnter={() => setPopped((prev) => new Set(prev).add(i))}
        />
      ))}
    </div>
  );
}

function ColorPreview() {
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {colors.map((c, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg transition-transform duration-300 hover:scale-110"
          style={{
            backgroundColor: c,
            animation: `pulse-color ${1.5 + i * 0.3}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function StackPreview({ color }: { color: string }) {
  const widths = [90, 85, 80, 72, 65, 55];
  return (
    <div className="flex flex-col items-center justify-end gap-0.5 p-2 h-full">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-sm"
          style={{
            width: `${w}%`,
            backgroundColor: color,
            opacity: 0.3 + i * 0.12,
            animation: i === 0 ? "stack-slide 1.5s ease-in-out infinite" : undefined,
          }}
        />
      ))}
    </div>
  );
}

function SudokuPreview({ color }: { color: string }) {
  const nums = [1, null, 3, 4, null, 2, null, 1, 4, 3, null, 2, 2, null, 4, 3];
  return (
    <div className="grid grid-cols-4 gap-0.5 p-3">
      {nums.map((n, i) => (
        <div
          key={i}
          className="flex aspect-square items-center justify-center rounded text-xs font-bold"
          style={{
            backgroundColor: n ? `${color}10` : "transparent",
            color: n ? color : "transparent",
            border: `1px solid ${color}20`,
          }}
        >
          {n || "?"}
        </div>
      ))}
    </div>
  );
}
