"use client";

import { useEffect, useRef } from "react";
import { useLogicGridStore } from "./store";
import { subGridKey } from "./engine";
import { useTimer } from "@/games/_shared/use-timer";
import { formatTime } from "@/lib/utils";
import type { GameState, GameCallbacks } from "@/types/game";

interface LogicGridProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const GAME_COLOR = "#16A34A";

/** Sub-grid rendering order for the L-shaped layout */
const SUB_GRIDS = [
  { key: "0-1", rowCat: 0, colCat: 1, gridRow: 0, gridCol: 0 },
  { key: "0-2", rowCat: 0, colCat: 2, gridRow: 0, gridCol: 1 },
  { key: "1-2", rowCat: 1, colCat: 2, gridRow: 1, gridCol: 1 },
];

export default function LogicGrid({
  gameState,
  setScore,
  callbacks,
}: LogicGridProps) {
  const store = useLogicGridStore();
  const timer = useTimer();
  const containerRef = useRef<HTMLDivElement>(null);

  // Lifecycle
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isComplete, gameState, timer.time, callbacks]);

  if (!store.puzzle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted">Press Play to start</p>
      </div>
    );
  }

  const cats = store.puzzle.categories;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex h-full flex-col items-center justify-center gap-4 p-4 outline-none sm:gap-6 sm:p-8"
    >
      {/* Timer */}
      <div className="font-mono text-2xl" style={{ color: GAME_COLOR }}>
        {formatTime(timer.time)}
      </div>

      {/* Grid area */}
      <div className="flex flex-col gap-0">
        {/* Row 0: cat0 headers | sub-grid 0-1 | sub-grid 0-2 */}
        <div className="flex">
          {/* Row label column (cat0 items) */}
          <div className="flex flex-col">
            {/* Empty corner for column headers */}
            <div style={{ width: 64, height: 24 }} />
            {cats[0].items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-end pr-2 text-xs font-medium text-foreground"
                style={{ width: 64, height: 36 }}
              >
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>

          {/* Sub-grid 0-1 */}
          <SubGrid
            sgKey={subGridKey(0, 1)}
            colCat={cats[1]}
            grid={store.grid}
            onToggle={store.toggleCell}
            isComplete={store.isComplete}
          />

          {/* Sub-grid 0-2 */}
          <SubGrid
            sgKey={subGridKey(0, 2)}
            colCat={cats[2]}
            grid={store.grid}
            onToggle={store.toggleCell}
            isComplete={store.isComplete}
          />
        </div>

        {/* Row 1: cat1 headers | empty | sub-grid 1-2 */}
        <div className="flex">
          {/* Row label column (cat1 items) */}
          <div className="flex flex-col">
            <div style={{ width: 64, height: 24 }} />
            {cats[1].items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-end pr-2 text-xs font-medium text-foreground"
                style={{ width: 64, height: 36 }}
              >
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>

          {/* Empty space where 1-1 would be */}
          <div style={{ width: 3 * 36, height: 3 * 36 + 24 }} />

          {/* Sub-grid 1-2 */}
          <SubGrid
            sgKey={subGridKey(1, 2)}
            colCat={cats[2]}
            grid={store.grid}
            onToggle={store.toggleCell}
            isComplete={store.isComplete}
          />
        </div>
      </div>

      {/* Clues */}
      <div
        className="w-full max-w-md rounded-lg border border-border bg-surface p-3"
        style={{ maxHeight: 160, overflowY: "auto" }}
      >
        <h3
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: GAME_COLOR }}
        >
          Clues
        </h3>
        <ol className="list-inside list-decimal space-y-1">
          {store.puzzle.clues.map((clue, i) => (
            <li key={i} className="text-xs leading-relaxed text-foreground">
              {clue.text}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-muted">
        Click cells to cycle: empty → ✓ yes → ✗ no → empty
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubGrid component
// ---------------------------------------------------------------------------

interface SubGridProps {
  sgKey: string;
  colCat: { name: string; items: [string, string, string] };
  grid: Record<string, import("./engine").CellMark[][]>;
  onToggle: (key: string, row: number, col: number) => void;
  isComplete: boolean;
}

function SubGrid({ sgKey, colCat, grid, onToggle, isComplete }: SubGridProps) {
  const sg = grid[sgKey];
  if (!sg) return null;

  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="flex">
        {colCat.items.map((item, c) => (
          <div
            key={c}
            className="flex items-end justify-center pb-1 text-xs font-medium text-foreground"
            style={{ width: 36, height: 24 }}
          >
            <span
              className="truncate"
              style={{ fontSize: 10, lineHeight: "12px" }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* 3×3 cells */}
      {sg.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            const isYes = cell === "yes";
            const isNo = cell === "no";

            return (
              <button
                key={c}
                onClick={() => !isComplete && onToggle(sgKey, r, c)}
                className="flex items-center justify-center border transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  borderColor: "rgba(148, 163, 184, 0.3)",
                  backgroundColor: isYes
                    ? "rgba(22, 163, 74, 0.15)"
                    : isNo
                      ? "rgba(239, 68, 68, 0.08)"
                      : "transparent",
                  cursor: isComplete ? "default" : "pointer",
                }}
              >
                {isYes && (
                  <span style={{ color: GAME_COLOR, fontWeight: 700, fontSize: 16 }}>
                    ✓
                  </span>
                )}
                {isNo && (
                  <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 14 }}>
                    ✗
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
