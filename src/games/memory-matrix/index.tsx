"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMemoryMatrixStore } from "./store";
import { getLevelConfig } from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface MemoryMatrixProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function MemoryMatrix({
  gameState,
  score,
  setScore,
  callbacks,
}: MemoryMatrixProps) {
  const store = useMemoryMatrixStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showingProgress, setShowingProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameEndedRef = useRef(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // Initialize game when playing starts
  useEffect(() => {
    if (gameState === "playing") {
      gameEndedRef.current = false;
      store.reset();
      // Small delay so reset applies before startLevel reads state
      setTimeout(() => {
        useMemoryMatrixStore.getState().startLevel();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Handle the "showing" phase timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (store.phase !== "showing") return;

    const config = getLevelConfig(store.level);
    const showTime = config.showTimeMs;

    // Animate progress bar
    setShowingProgress(0);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / showTime, 1);
      setShowingProgress(progress);
      if (progress >= 1 && progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }, 30);

    // Transition to input phase after showTime
    timerRef.current = setTimeout(() => {
      useMemoryMatrixStore.setState({ phase: "input" });
      timerRef.current = null;
    }, showTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.phase, store.level, gameState]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (store.phase !== "input" || gameState !== "playing") return;

    const correct = store.submitGuess();

    if (correct) {
      // Award points: level * 100
      const points = store.level * 100;
      setScore((prev: number) => prev + points);

      // Advance to next level after a brief delay
      setTimeout(() => {
        const currentLevel = useMemoryMatrixStore.getState().level;
        useMemoryMatrixStore.setState({ level: currentLevel + 1 });
        useMemoryMatrixStore.getState().startLevel();
      }, 800);
    } else {
      // Game over after showing the result briefly
      if (!gameEndedRef.current) {
        gameEndedRef.current = true;
        setTimeout(() => {
          callbacks.onGameEnd(score);
        }, 1200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.phase, store.level, gameState, score, setScore, callbacks]);

  const config = getLevelConfig(store.level);
  const totalCells = store.gridSize * store.gridSize;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      {/* Level and score indicators */}
      <div className="flex w-full max-w-sm items-center justify-between">
        <div className="text-sm font-bold text-accent-primary">
          Level {store.level}
        </div>
        <div className="text-sm text-muted">
          Score: <span className="font-bold text-foreground">{score}</span>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center">
        {store.phase === "showing" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-accent-yellow animate-pulse">
              Memorize the pattern!
            </p>
            {/* Progress bar */}
            <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent-yellow transition-all duration-100"
                style={{ width: `${(1 - showingProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
        {store.phase === "input" && (
          <p className="text-sm font-medium text-accent-primary">
            Select the cells you remember ({config.highlightCount} cells)
          </p>
        )}
        {store.phase === "result" && store.isCorrect === true && (
          <p className="text-sm font-bold text-accent-tertiary">
            Correct! +{store.level * 100} points
          </p>
        )}
        {store.phase === "result" && store.isCorrect === false && (
          <p className="text-sm font-bold text-accent-secondary">
            Wrong! Game Over
          </p>
        )}
      </div>

      {/* Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${store.gridSize}, 1fr)`,
          width: `${store.gridSize * 60 + (store.gridSize - 1) * 8}px`,
        }}
      >
        {Array.from({ length: totalCells }, (_, i) => {
          const isInPattern = store.pattern.has(i);
          const isSelected = store.selected.has(i);
          const isShowing = store.phase === "showing";
          const isResult = store.phase === "result";

          // Determine cell appearance
          let cellClasses =
            "flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all duration-300 ";

          if (isShowing && isInPattern) {
            // Showing phase: highlight pattern cells with cyan glow
            cellClasses +=
              "border-[#0891B2] bg-[#0891B2]/30 shadow-[0_0_12px_rgba(8,145,178,0.5)]";
          } else if (isResult && isInPattern && isSelected) {
            // Result: correctly selected
            cellClasses +=
              "border-accent-tertiary bg-accent-tertiary/20 shadow-[0_0_8px_rgba(22,163,74,0.4)]";
          } else if (isResult && isInPattern && !isSelected) {
            // Result: missed cell (was in pattern but not selected)
            cellClasses +=
              "border-accent-secondary bg-accent-secondary/20 shadow-[0_0_8px_rgba(220,38,38,0.4)]";
          } else if (isResult && !isInPattern && isSelected) {
            // Result: incorrectly selected (not in pattern but selected)
            cellClasses +=
              "border-accent-yellow bg-accent-yellow/20";
          } else if (!isShowing && isSelected) {
            // Input phase: selected cell
            cellClasses +=
              "border-[#0891B2] bg-[#0891B2]/25 shadow-[0_0_8px_rgba(8,145,178,0.3)]";
          } else {
            // Default empty cell
            cellClasses +=
              "border-border bg-surface hover:border-muted";
          }

          // Only allow clicks during input phase
          const isClickable = store.phase === "input";

          return (
            <button
              key={i}
              onClick={() => isClickable && store.toggleCell(i)}
              disabled={!isClickable}
              className={cellClasses}
              style={{
                cursor: isClickable ? "pointer" : "default",
                transform:
                  isShowing && isInPattern
                    ? "scale(1.05)"
                    : isSelected && store.phase === "input"
                      ? "scale(0.95)"
                      : "scale(1)",
              }}
              aria-label={`Cell ${i}${isSelected ? " selected" : ""}`}
            >
              {/* Show a dot indicator on selected cells during input */}
              {store.phase === "input" && isSelected && (
                <div className="h-3 w-3 rounded-full bg-[#0891B2]" />
              )}
              {/* Show indicators during result phase */}
              {isResult && isInPattern && isSelected && (
                <svg
                  className="h-5 w-5 text-accent-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {isResult && isInPattern && !isSelected && (
                <svg
                  className="h-5 w-5 text-accent-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {isResult && !isInPattern && isSelected && (
                <div className="h-2 w-2 rounded-full bg-accent-yellow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit button (only during input phase) */}
      {store.phase === "input" && (
        <button
          onClick={handleSubmit}
          className="rounded-lg border-2 border-accent-primary bg-accent-primary/10 px-8 py-3 text-sm font-bold text-accent-primary transition-all hover:bg-accent-primary/20 hover:shadow-[0_0_16px_rgba(96,165,250,0.3)] active:scale-95"
        >
          Submit ({store.selected.size} / {config.highlightCount})
        </button>
      )}

      {/* Help text */}
      <p className="max-w-xs text-center text-xs text-muted">
        {store.phase === "showing"
          ? "Watch the highlighted cells carefully..."
          : store.phase === "input"
            ? "Tap the cells that were highlighted, then submit."
            : store.isCorrect
              ? "Getting ready for the next level..."
              : "Better luck next time!"}
      </p>
    </div>
  );
}
