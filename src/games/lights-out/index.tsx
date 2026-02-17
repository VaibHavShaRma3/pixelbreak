"use client";

import { useEffect, useRef, useCallback } from "react";
import { useLightsOutStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface LightsOutProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const MAX_LEVEL = 5;

export default function LightsOut({
  gameState,
  score,
  setScore,
  callbacks,
}: LightsOutProps) {
  const store = useLightsOutStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  // Track accumulated score across levels
  const accumulatedScoreRef = useRef(0);

  // Initialize on play
  useEffect(() => {
    if (gameState === "playing") {
      accumulatedScoreRef.current = 0;
      setScore(0);
      store.initPuzzle(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Handle level completion
  useEffect(() => {
    if (!store.isComplete || gameState !== "playing") return;

    // Score: max(1000 - moves * 50, 100)
    const levelScore = Math.max(1000 - store.moves * 50, 100);
    accumulatedScoreRef.current += levelScore;
    setScore(accumulatedScoreRef.current);

    if (store.level >= MAX_LEVEL) {
      // Game finished after 5 levels
      const finalScore = accumulatedScoreRef.current;
      // Small delay so user can see the solved board
      setTimeout(() => {
        callbacks.onGameEnd(finalScore);
      }, 800);
    } else {
      // Advance to next level after a brief pause
      setTimeout(() => {
        store.initPuzzle(store.level + 1);
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isComplete]);

  const handleToggle = useCallback(
    (index: number) => {
      if (gameState !== "playing" || store.isComplete) return;
      store.toggle(index);
    },
    [gameState, store]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6">
      {/* Header info */}
      <div className="flex items-center gap-6 text-sm font-mono">
        <span className="text-muted">
          Level{" "}
          <span className="text-[#16A34A] font-bold text-base">
            {store.level}
          </span>
          <span className="text-muted/60">/{MAX_LEVEL}</span>
        </span>
        <span className="text-muted">
          Moves{" "}
          <span className="text-foreground font-bold text-base">
            {store.moves}
          </span>
        </span>
        <span className="text-muted">
          Score{" "}
          <span className="text-[#16A34A] font-bold text-base">{score}</span>
        </span>
      </div>

      {/* 5x5 Grid */}
      <div className="grid grid-cols-5 gap-2">
        {store.grid.map((lit, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;

          return (
            <button
              key={`${store.level}-${i}`}
              onClick={() => handleToggle(i)}
              disabled={gameState !== "playing" || store.isComplete}
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]/50"
              style={{
                backgroundColor: lit ? "#16A34A" : "#1a1a2e",
                borderColor: lit ? "#22c55e" : "#2a2a3e",
                boxShadow: lit
                  ? "0 0 16px rgba(22, 163, 74, 0.5), 0 0 32px rgba(22, 163, 74, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "inset 0 2px 4px rgba(0,0,0,0.3)",
              }}
              aria-label={`Row ${row + 1}, Column ${col + 1}: ${lit ? "on" : "off"}`}
            >
              {/* Inner glow circle for lit cells */}
              <span
                className="absolute inset-2 rounded-md transition-opacity duration-200"
                style={{
                  opacity: lit ? 1 : 0,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Level complete flash */}
      {store.isComplete && (
        <div className="animate-pulse text-center">
          <p className="text-lg font-bold text-[#16A34A]">
            {store.level >= MAX_LEVEL
              ? "All levels cleared!"
              : `Level ${store.level} complete!`}
          </p>
          <p className="text-xs text-muted mt-1">
            {store.level >= MAX_LEVEL
              ? `Final score: ${score}`
              : `+${Math.max(1000 - store.moves * 50, 100)} points`}
          </p>
        </div>
      )}

      {/* Instructions */}
      {!store.isComplete && (
        <p className="text-xs text-muted text-center max-w-xs">
          Click a cell to toggle it and its neighbors. Turn all lights off to
          win. Fewer moves = higher score.
        </p>
      )}
    </div>
  );
}
