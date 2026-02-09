"use client";

import { useEffect, useRef } from "react";
import { useSudokuStore } from "./store";
import { useTimer } from "@/games/_shared/use-timer";
import { getConflicts } from "./engine";
import { formatTime } from "@/lib/utils";
import type { GameState, GameCallbacks } from "@/types/game";

interface SudokuLiteProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function SudokuLite({
  gameState,
  setScore,
  callbacks,
}: SudokuLiteProps) {
  const store = useSudokuStore();
  const timer = useTimer();
  const containerRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  // Auto-focus container for keyboard input
  useEffect(() => {
    if (gameState === "playing") {
      store.initPuzzle();
      timer.reset();
      timer.start();
      containerRef.current?.focus();
    }
    if (gameState === "paused") {
      timer.stop();
    }
  }, [gameState]);

  // Sync timer to score
  useEffect(() => {
    setScore(timer.time);
  }, [timer.time, setScore]);

  // Check completion
  useEffect(() => {
    if (store.isComplete && gameState === "playing") {
      timer.stop();
      callbacks.onGameEnd(timer.time);
    }
  }, [store.isComplete, gameState, timer.time, callbacks]);

  // Keyboard input — use ref to avoid re-registering on every cell change
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = storeRef.current;
      if (s.selectedCell === null) return;

      if (e.key >= "1" && e.key <= "4") {
        s.setCell(s.selectedCell, parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        s.setCell(s.selectedCell, null);
      } else if (e.key === "ArrowUp" && s.selectedCell >= 4) {
        e.preventDefault();
        s.selectCell(s.selectedCell - 4);
      } else if (e.key === "ArrowDown" && s.selectedCell < 12) {
        e.preventDefault();
        s.selectCell(s.selectedCell + 4);
      } else if (e.key === "ArrowLeft" && s.selectedCell % 4 > 0) {
        e.preventDefault();
        s.selectCell(s.selectedCell - 1);
      } else if (e.key === "ArrowRight" && s.selectedCell % 4 < 3) {
        e.preventDefault();
        s.selectCell(s.selectedCell + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const getConflictsForCell = (pos: number) => {
    const value = store.playerGrid[pos];
    if (value === null) return [];
    return getConflicts(store.playerGrid, pos, value);
  };

  return (
    <div ref={containerRef} tabIndex={0} className="flex h-full flex-col items-center justify-center gap-6 p-8 outline-none">
      {/* Timer */}
      <div className="font-mono text-2xl text-neon-purple">
        {formatTime(timer.time)}
      </div>

      {/* 4x4 Grid */}
      <div className="grid grid-cols-4 gap-0 rounded-lg border-2 border-neon-purple/50">
        {store.playerGrid.map((value, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const isFixed = store.fixedCells.has(i);
          const isSelected = store.selectedCell === i;
          const hasConflict = value !== null && getConflictsForCell(i).length > 0;

          // Box borders
          const borderRight = col === 1 ? "border-r-2 border-r-neon-purple/30" : "";
          const borderBottom = row === 1 ? "border-b-2 border-b-neon-purple/30" : "";

          return (
            <button
              key={i}
              onClick={() => store.selectCell(i)}
              className={`flex h-16 w-16 items-center justify-center border border-border text-xl font-bold transition-all sm:h-20 sm:w-20 sm:text-2xl
                ${borderRight} ${borderBottom}
                ${isSelected ? "bg-neon-purple/20 border-neon-purple" : ""}
                ${isFixed ? "text-foreground" : "text-neon-cyan"}
                ${hasConflict ? "text-neon-pink bg-neon-pink/10" : ""}
                ${!isFixed ? "cursor-pointer hover:bg-surface-2" : "cursor-default"}
              `}
            >
              {value || ""}
            </button>
          );
        })}
      </div>

      {/* Number input buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => {
              if (store.selectedCell !== null) {
                store.setCell(store.selectedCell, num);
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface text-lg font-bold text-foreground transition-all hover:border-neon-purple hover:text-neon-purple"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => {
            if (store.selectedCell !== null) {
              store.setCell(store.selectedCell, null);
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted transition-all hover:border-neon-pink hover:text-neon-pink"
        >
          Clear
        </button>
      </div>

      <p className="text-xs text-muted">
        Click a cell, then type 1-4 or use the buttons. Arrow keys to navigate.
      </p>
    </div>
  );
}
