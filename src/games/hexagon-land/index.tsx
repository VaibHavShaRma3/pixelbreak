"use client";

import { useEffect, useState, useCallback } from "react";
import { useHexagonLandStore, type Biome } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface HexagonLandProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const BIOME_CONFIG: Record<
  Biome,
  { color: string; emoji: string; label: string }
> = {
  forest: { color: "#22c55e", emoji: "\ud83c\udf32", label: "Forest" },
  water: { color: "#3b82f6", emoji: "\ud83c\udf0a", label: "Water" },
  mountain: { color: "#9ca3af", emoji: "\u26f0\ufe0f", label: "Mountain" },
  desert: { color: "#eab308", emoji: "\ud83c\udfdc\ufe0f", label: "Desert" },
  city: { color: "#a855f7", emoji: "\ud83c\udfd9\ufe0f", label: "City" },
  farm: { color: "#f97316", emoji: "\ud83c\udf3e", label: "Farm" },
};

const HEX_SIZE = 28; // half-width of hex
const HEX_H = HEX_SIZE * Math.sqrt(3); // hex height
const HEX_W = HEX_SIZE * 2; // hex width

function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (3 / 2) * q;
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

function BiomeTile({ biome }: { biome: Biome }) {
  const config = BIOME_CONFIG[biome];
  return (
    <span className="text-sm" title={config.label}>
      {config.emoji}
    </span>
  );
}

function QueueTile({ biome }: { biome: Biome }) {
  const config = BIOME_CONFIG[biome];
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border"
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: `${config.color}20`,
        borderColor: `${config.color}40`,
      }}
    >
      <span className="text-lg">{config.emoji}</span>
    </div>
  );
}

export default function HexagonLand({
  gameState,
  score,
  setScore,
  callbacks,
}: HexagonLandProps) {
  const store = useHexagonLandStore();
  const [lastPlacement, setLastPlacement] = useState<{
    q: number;
    r: number;
    points: number;
  } | null>(null);
  const [hoverCell, setHoverCell] = useState<{
    q: number;
    r: number;
  } | null>(null);

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
    }
  }, [gameState, store.reset, setScore]);

  // Check game over when tiles run out
  useEffect(() => {
    if (gameState === "playing" && store.tilesRemaining <= 0) {
      setTimeout(() => {
        callbacks.onGameEnd(store.score);
      }, 800);
    }
  }, [gameState, store.tilesRemaining, store.score, callbacks]);

  const handlePlaceTile = useCallback(
    (q: number, r: number) => {
      if (gameState !== "playing") return;
      if (store.tilesRemaining <= 0) return;

      const cell = store.grid.find((c) => c.q === q && c.r === r);
      if (!cell || cell.biome !== null) return;

      const points = store.placeTile(q, r);
      if (points > 0) {
        setScore(store.score + points);
        setLastPlacement({ q, r, points });
        setTimeout(() => setLastPlacement(null), 1000);
      }
    },
    [gameState, store, setScore]
  );

  // Calculate grid bounds for centering
  const positions = store.grid.map((cell) => ({
    ...cell,
    ...hexToPixel(cell.q, cell.r),
  }));

  const minX = Math.min(...positions.map((p) => p.x)) - HEX_SIZE;
  const maxX = Math.max(...positions.map((p) => p.x)) + HEX_SIZE;
  const minY = Math.min(...positions.map((p) => p.y)) - HEX_H / 2;
  const maxY = Math.max(...positions.map((p) => p.y)) + HEX_H / 2;
  const gridWidth = maxX - minX + HEX_W;
  const gridHeight = maxY - minY + HEX_H;

  const currentBiomeConfig = BIOME_CONFIG[store.currentTile];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      {/* Header: score and tiles remaining */}
      <div className="flex w-full max-w-md items-center justify-between">
        <div className="text-sm text-muted">
          Score: <span className="font-bold text-neon-cyan">{store.score}</span>
        </div>
        <div className="text-sm text-muted">
          Tiles left:{" "}
          <span className="font-bold text-neon-yellow">
            {store.tilesRemaining}
          </span>
        </div>
      </div>

      {/* Current tile and queue */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted">Current</span>
          <div
            className="flex items-center justify-center rounded-xl border-2"
            style={{
              width: "52px",
              height: "52px",
              backgroundColor: `${currentBiomeConfig.color}25`,
              borderColor: currentBiomeConfig.color,
              boxShadow: `0 0 12px ${currentBiomeConfig.color}40`,
            }}
          >
            <span className="text-2xl">{currentBiomeConfig.emoji}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted text-lg">
          {"\u2192"}
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted">Next</span>
          <div className="flex gap-2">
            {store.queue.map((biome, i) => (
              <QueueTile key={i} biome={biome} />
            ))}
          </div>
        </div>
      </div>

      {/* Hex grid */}
      <div
        className="relative"
        style={{
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
        }}
      >
        {positions.map((cell) => {
          const cx = cell.x - minX + HEX_SIZE;
          const cy = cell.y - minY + HEX_H / 2;
          const isEmpty = cell.biome === null;
          const isHovered =
            hoverCell?.q === cell.q && hoverCell?.r === cell.r;
          const isLastPlaced =
            lastPlacement?.q === cell.q && lastPlacement?.r === cell.r;
          const biomeConf = cell.biome
            ? BIOME_CONFIG[cell.biome]
            : null;

          return (
            <div
              key={`${cell.q}-${cell.r}`}
              className={`absolute flex items-center justify-center transition-all duration-200 ${
                isEmpty && gameState === "playing"
                  ? "cursor-pointer"
                  : ""
              }`}
              style={{
                left: `${cx - HEX_SIZE}px`,
                top: `${cy - HEX_H / 2}px`,
                width: `${HEX_W}px`,
                height: `${HEX_H}px`,
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundColor: biomeConf
                  ? `${biomeConf.color}30`
                  : isHovered && isEmpty
                  ? `${currentBiomeConfig.color}15`
                  : "#1a1a2610",
                border: "none",
                transform: isLastPlaced ? "scale(1.1)" : "scale(1)",
              }}
              onClick={() => isEmpty && handlePlaceTile(cell.q, cell.r)}
              onMouseEnter={() =>
                isEmpty && setHoverCell({ q: cell.q, r: cell.r })
              }
              onMouseLeave={() => setHoverCell(null)}
            >
              {/* Inner hex border */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  clipPath:
                    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  border: `1px solid ${
                    biomeConf
                      ? `${biomeConf.color}60`
                      : isHovered && isEmpty
                      ? `${currentBiomeConfig.color}40`
                      : "#2a2a3a40"
                  }`,
                }}
              />

              {biomeConf ? (
                <BiomeTile biome={cell.biome!} />
              ) : isHovered && gameState === "playing" ? (
                <span className="text-sm opacity-40">
                  {currentBiomeConfig.emoji}
                </span>
              ) : null}

              {/* Points popup */}
              {isLastPlaced && lastPlacement && (
                <div
                  className="absolute -top-6 text-xs font-bold animate-bounce"
                  style={{
                    color:
                      lastPlacement.points > 1
                        ? "#39ff14"
                        : "#00fff5",
                    textShadow: `0 0 6px ${
                      lastPlacement.points > 1
                        ? "#39ff1460"
                        : "#00fff560"
                    }`,
                  }}
                >
                  +{lastPlacement.points}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted">
        {Object.entries(BIOME_CONFIG).map(([key, conf]) => (
          <div key={key} className="flex items-center gap-1">
            <span>{conf.emoji}</span>
            <span>{conf.label}</span>
          </div>
        ))}
      </div>

      {/* Match bonus hint */}
      <p className="text-xs text-muted text-center">
        Place tiles adjacent to matching biomes for +3 bonus each
      </p>
    </div>
  );
}
