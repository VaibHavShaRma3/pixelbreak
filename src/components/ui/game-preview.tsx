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
      {slug === "zen-garden" && <ZenGardenPreview color={color} />}
      {slug === "workspace-pet" && <WorkspacePetPreview color={color} />}
      {slug === "focus-forest" && <FocusForestPreview color={color} />}
      {slug === "neon-rhythm" && <NeonRhythmPreview color={color} />}
      {slug === "hexagon-land" && <HexagonLandPreview color={color} />}
      {slug === "one-minute-barista" && <BaristaPreview color={color} />}
      {slug === "magnetic-poetry" && <MagneticPoetryPreview color={color} />}
      {slug === "community-grid" && <CommunityGridPreview color={color} />}
      {![
        "bubble-wrap", "color-match", "stack", "sudoku-lite",
        "daily-pixel-puzzle", "lo-fi-typer", "falling-sand",
        "syntax-breaker", "constellation-hunter", "gacha-capsule",
        "zen-garden", "workspace-pet", "focus-forest", "neon-rhythm",
        "hexagon-land", "one-minute-barista", "magnetic-poetry", "community-grid",
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

function ZenGardenPreview({ color }: { color: string }) {
  return (
    <div className="relative h-full w-full p-2" style={{ backgroundColor: "#d4c5a0" }}>
      {/* Rake lines */}
      {[20, 35, 50, 65, 80].map((y, i) => (
        <div
          key={i}
          className="absolute h-px w-3/4 left-[12%]"
          style={{ top: `${y}%`, backgroundColor: "#b8a77a", opacity: 0.6 }}
        />
      ))}
      {/* Stone */}
      <div
        className="absolute h-4 w-5 rounded-full"
        style={{ left: "25%", top: "30%", backgroundColor: "#888", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
      />
      {/* Plant */}
      <div className="absolute" style={{ left: "65%", top: "20%" }}>
        <div className="h-4 w-1 mx-auto" style={{ backgroundColor: "#5a8a3c" }} />
        <div className="h-3 w-3 rounded-full -mt-1" style={{ backgroundColor: color, opacity: 0.8 }} />
      </div>
    </div>
  );
}

function WorkspacePetPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3">
      <div className="text-3xl" style={{ animation: "pulse 2s ease-in-out infinite" }}>
        \uD83D\uDE0A
      </div>
      <div className="flex gap-2 w-full px-2">
        {[
          { c: "#f97316", w: 80 },
          { c: color, w: 65 },
          { c: "#22c55e", w: 90 },
        ].map((bar, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${bar.c}20` }}>
            <div className="h-full rounded-full" style={{ width: `${bar.w}%`, backgroundColor: bar.c }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusForestPreview({ color }: { color: string }) {
  return (
    <div className="relative h-full w-full" style={{ background: "linear-gradient(180deg, #0a1628 0%, #0a1628 60%, #1a4a2e 100%)" }}>
      {/* Stars */}
      {[10, 30, 50, 70, 85].map((x, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{ left: `${x}%`, top: `${10 + i * 8}%`, opacity: 0.4 + (i % 3) * 0.2 }}
        />
      ))}
      {/* Tree */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
        <div className="h-3 w-1.5 mx-auto" style={{ backgroundColor: "#8B4513" }} />
        <div className="h-5 w-5 rounded-full -mt-2 mx-auto" style={{ backgroundColor: color, opacity: 0.9 }} />
        <div className="h-4 w-4 rounded-full -mt-3 mx-auto" style={{ backgroundColor: "#22c55e" }} />
      </div>
    </div>
  );
}

function NeonRhythmPreview({ color }: { color: string }) {
  const lanes = ["#00fff5", color, "#39ff14", "#ffe600"];
  return (
    <div className="flex h-full items-end justify-center gap-1 p-2 pb-4" style={{ backgroundColor: "#0a0a1a" }}>
      {lanes.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-1 w-5">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="h-3 w-4 rounded-sm"
              style={{
                backgroundColor: c,
                opacity: 0.3 + n * 0.3,
                animation: `fade-up ${1 + n * 0.3}s ease-in-out infinite alternate`,
              }}
            />
          ))}
          <div className="h-px w-5 mt-1" style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}` }} />
          <span className="text-[7px] font-mono" style={{ color: c }}>
            {["D", "F", "J", "K"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function HexagonLandPreview({ color }: { color: string }) {
  const biomes = [
    { c: "#22c55e", e: "\uD83C\uDF32" },
    { c: "#3b82f6", e: "\uD83C\uDF0A" },
    { c: "#6b7280", e: "\u26F0\uFE0F" },
    { c: "#eab308", e: "\uD83C\uDFDC\uFE0F" },
    { c: color, e: "\uD83C\uDF3E" },
    { c: "#a855f7", e: "\uD83C\uDFD9\uFE0F" },
    { c: "#22c55e", e: "\uD83C\uDF32" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 p-3">
      {biomes.map((b, i) => (
        <div
          key={i}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[8px]"
          style={{
            backgroundColor: `${b.c}30`,
            border: `1px solid ${b.c}60`,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        >
          {b.e}
        </div>
      ))}
    </div>
  );
}

function BaristaPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-3">
      <div className="text-2xl">\u2615</div>
      <div className="flex gap-1">
        {["\uD83E\uDD5B", "\u2615", "\uD83E\uDDCA"].map((e, i) => (
          <div
            key={i}
            className="flex h-5 w-5 items-center justify-center rounded text-[8px]"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          >
            {e}
          </div>
        ))}
      </div>
      <div className="mt-1 h-1 w-16 overflow-hidden rounded-full" style={{ backgroundColor: `${color}20` }}>
        <div
          className="h-full rounded-full"
          style={{
            width: "65%",
            backgroundColor: color,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>
      <span className="text-[7px] text-gray-500">0:42</span>
    </div>
  );
}

function MagneticPoetryPreview({ color }: { color: string }) {
  const words = ["dream", "the", "wild", "moon"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 p-3" style={{ backgroundColor: "#1a1a2e" }}>
      {words.map((w, i) => (
        <div
          key={i}
          className="rounded px-1.5 py-0.5 text-[9px] font-bold"
          style={{
            backgroundColor: "#fff",
            color: "#1a1a2e",
            boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            transform: `rotate(${-3 + i * 2}deg)`,
          }}
        >
          {w}
        </div>
      ))}
    </div>
  );
}

function CommunityGridPreview({ color }: { color: string }) {
  const pixels = [
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 0, 1, 0,
    1, 0, 2, 0, 0, 2, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 3, 0, 0, 3, 0, 1,
    1, 0, 0, 3, 3, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
  ];
  const colors = ["transparent", color, "#ff2d95", "#ffe600"];
  return (
    <div className="grid grid-cols-8 gap-px p-2" style={{ backgroundColor: "#0a0a0f" }}>
      {pixels.map((p, i) => (
        <div
          key={i}
          className="aspect-square rounded-[1px]"
          style={{ backgroundColor: colors[p], opacity: p ? 0.9 : 0.15 }}
        />
      ))}
    </div>
  );
}
