"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useBubbleStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface BubbleWrapProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const GRID_SIZE = 10;
const TOTAL = GRID_SIZE * GRID_SIZE;
const GAME_DURATION = 30; // seconds

export default function BubbleWrap({
  gameState,
  score,
  setScore,
  callbacks,
}: BubbleWrapProps) {
  const { popped, pop, reset } = useBubbleStore();
  const [popAnim, setPopAnim] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const endedRef = useRef(false);

  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setTimeLeft(GAME_DURATION);
      endedRef.current = false;
    }
  }, [gameState, reset]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!endedRef.current) {
            endedRef.current = true;
            setTimeout(() => callbacks.onGameEnd(scoreRef.current), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, callbacks]);

  // When all bubbles popped, regenerate
  useEffect(() => {
    if (popped.size === TOTAL && gameState === "playing") {
      // Small delay then reset grid (keep score)
      const timeout = setTimeout(() => reset(), 500);
      return () => clearTimeout(timeout);
    }
  }, [popped.size, gameState, reset]);

  const handlePop = useCallback(
    (index: number) => {
      if (gameState !== "playing" || popped.has(index)) return;
      pop(index);
      setScore((prev: number) => prev + 1);
      setPopAnim(index);
      setTimeout(() => setPopAnim(null), 200);
    },
    [gameState, popped, pop, setScore]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      {/* Timer */}
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-2xl font-bold"
          style={{
            color: timeLeft <= 5 ? "#ff2d95" : "#00fff5",
            textShadow: timeLeft <= 5 ? "0 0 10px #ff2d95" : "none",
          }}
        >
          {timeLeft}s
        </span>
        <span className="text-sm text-muted">Pop as many as you can!</span>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const isPopped = popped.has(i);
          const isAnimating = popAnim === i;
          return (
            <button
              key={i}
              onClick={() => handlePop(i)}
              className={`aspect-square rounded-full border-2 transition-all duration-150 ${
                isPopped
                  ? "scale-90 border-border bg-surface-2 opacity-30"
                  : "cursor-pointer border-neon-cyan/40 bg-neon-cyan/10 hover:bg-neon-cyan/20 hover:border-neon-cyan/60 active:scale-95"
              } ${isAnimating ? "scale-75" : ""}`}
              disabled={isPopped}
              aria-label={`Bubble ${i + 1}${isPopped ? " (popped)" : ""}`}
            >
              {!isPopped && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-1/3 w-1/3 rounded-full bg-white/20" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
