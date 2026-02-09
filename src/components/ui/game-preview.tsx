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
      {slug === "daily-pixel-puzzle" && <PixelPuzzlePreview color={color} />}
      {slug === "lo-fi-typer" && <TyperPreview color={color} />}
      {slug === "falling-sand" && <FallingSandPreview color={color} />}
      {slug === "syntax-breaker" && <SyntaxBreakerPreview color={color} />}
      {slug === "constellation-hunter" && <ConstellationPreview color={color} />}
      {slug === "gacha-capsule" && <GachaPreview color={color} />}
      {![
        "bubble-wrap", "color-match", "stack", "sudoku-lite",
        "daily-pixel-puzzle", "lo-fi-typer", "falling-sand",
        "syntax-breaker", "constellation-hunter", "gacha-capsule",
      ].includes(slug) && (
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

function PixelPuzzlePreview({ color }: { color: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  // Simple heart pattern colors for preview
  const pixels = [
    0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
  ];
  return (
    <div className="grid grid-cols-8 gap-px p-2">
      {pixels.slice(0, 48).map((p, i) => (
        <div
          key={i}
          className="aspect-square rounded-[1px] transition-all duration-200"
          style={{
            backgroundColor: revealed.has(i) ? (p ? color : "#222") : "#333",
            opacity: revealed.has(i) ? 1 : 0.5,
          }}
          onMouseEnter={() => setRevealed((prev) => new Set(prev).add(i))}
        />
      ))}
    </div>
  );
}

function TyperPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-3">
      <div className="flex gap-0.5 font-mono text-[10px]">
        {"pixel".split("").map((ch, i) => (
          <span
            key={i}
            style={{
              color: i < 3 ? "#4ade80" : i === 3 ? "#fff" : `${color}40`,
              animation: i === 3 ? "blink 1s step-end infinite" : undefined,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div
        className="mt-1 text-lg font-bold"
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        5x
      </div>
      <div className="text-[8px] text-gray-500">combo</div>
    </div>
  );
}

function FallingSandPreview({ color }: { color: string }) {
  const particles = [
    { x: 3, y: 5, c: "#c2b280" },
    { x: 4, y: 5, c: "#c2b280" },
    { x: 3, y: 4, c: "#c2b280" },
    { x: 5, y: 5, c: "#c2b280" },
    { x: 4, y: 4, c: "#c2b280" },
    { x: 1, y: 5, c: "#4444ff" },
    { x: 2, y: 5, c: "#4444ff" },
    { x: 1, y: 4, c: "#4444ff" },
    { x: 6, y: 2, c: "#ff4400" },
    { x: 6, y: 1, c: "#ff8800" },
    { x: 7, y: 3, c: "#888" },
    { x: 7, y: 4, c: "#888" },
    { x: 7, y: 5, c: "#888" },
  ];
  return (
    <div className="relative h-full w-full p-2">
      <div
        className="grid h-full w-full rounded"
        style={{
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          backgroundColor: "#0a0a0a",
          gap: "1px",
        }}
      >
        {Array.from({ length: 48 }, (_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const p = particles.find((p) => p.x === x && p.y === y);
          return (
            <div
              key={i}
              className="rounded-[1px]"
              style={{
                backgroundColor: p ? p.c : "transparent",
                animation: p && p.c === "#ff4400" ? "pulse 1s ease-in-out infinite" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SyntaxBreakerPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 font-mono text-[9px]">
      <div className="text-gray-500">
        <span style={{ color: "#00fff5" }}>function</span>{" "}
        <span className="text-white">greet</span>() {"{"}
      </div>
      <div className="text-white">
        {"  "}
        <span style={{ color: "#39ff14" }}>&quot;Hello&quot;</span>
      </div>
      <div
        className="rounded px-1"
        style={{
          backgroundColor: `${color}15`,
          color: "#ff4444",
          textDecoration: "underline wavy",
          textDecorationColor: "#ff4444",
        }}
      >
        {"  retrun"} x
      </div>
      <div className="text-gray-500">{"}"}</div>
    </div>
  );
}

function ConstellationPreview({ color }: { color: string }) {
  const stars = [
    { x: 20, y: 15 },
    { x: 40, y: 10 },
    { x: 60, y: 20 },
    { x: 50, y: 45 },
    { x: 30, y: 40 },
  ];
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: "#0a0a2e" }}>
      {/* Lines */}
      <svg className="absolute inset-0 h-full w-full">
        <line
          x1="20%" y1="15%" x2="40%" y2="10%"
          stroke={color} strokeWidth="1" opacity="0.6"
        />
        <line
          x1="40%" y1="10%" x2="60%" y2="20%"
          stroke={color} strokeWidth="1" opacity="0.6"
        />
        <line
          x1="60%" y1="20%" x2="50%" y2="45%"
          stroke={color} strokeWidth="1" opacity="0.4"
          strokeDasharray="3 3"
        />
      </svg>
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            backgroundColor: i < 3 ? "#fff" : `${color}80`,
            boxShadow: `0 0 6px ${color}`,
            transform: "translate(-50%, -50%)",
            animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      {/* Small bg stars */}
      {[15, 75, 85, 10, 55, 90, 35, 70].map((x, i) => (
        <div
          key={`bg-${i}`}
          className="absolute h-0.5 w-0.5 rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${(i * 37 + 20) % 90}%`,
            opacity: 0.3 + (i % 3) * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function GachaPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-2">
      {/* Mini capsule machine */}
      <div
        className="flex h-16 w-12 flex-col items-center justify-center rounded-xl border"
        style={{
          borderColor: color,
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border text-xs"
          style={{ borderColor: color }}
        >
          ?
        </div>
      </div>
      <div className="h-1 w-14 rounded-b" style={{ backgroundColor: color, opacity: 0.5 }} />
      {/* Mini items */}
      <div className="mt-1 flex gap-1">
        {["\u2694\uFE0F", "\uD83D\uDC8E", "\uD83D\uDC51"].map((emoji, i) => (
          <span key={i} className="text-xs" style={{ opacity: 0.5 + i * 0.25 }}>
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
