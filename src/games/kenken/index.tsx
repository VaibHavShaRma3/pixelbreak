"use client";

import { useEffect, useRef, useMemo } from "react";
import { useKenKenStore } from "./store";
import { useTimer } from "@/games/_shared/use-timer";
import { formatTime } from "@/lib/utils";
import type { GameState, GameCallbacks } from "@/types/game";

interface KenKenProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function KenKen({
  gameState,
  setScore,
  callbacks,
}: KenKenProps) {
  const store = useKenKenStore();
  const timer = useTimer();
  const containerRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  // ---------------------------------------------------------------------------
  // Lifecycle: init / pause
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Keyboard input
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Pre-compute cage lookup: cellIndex -> cageIndex
  // And determine which cell is the "label" cell (top-left) of each cage
  // ---------------------------------------------------------------------------

  const { cellToCage, cageLabelCell } = useMemo(() => {
    if (!store.puzzle) return { cellToCage: new Map(), cageLabelCell: new Map() };

    const mapping = new Map<number, number>();
    const labels = new Map<number, number>(); // cageIndex -> labelCellIndex

    store.puzzle.cages.forEach((cage, ci) => {
      // Find the top-left cell of this cage:
      // the cell with the smallest row, then smallest column
      let labelCell = cage.cells[0];
      let labelRow = Math.floor(labelCell / 4);
      let labelCol = labelCell % 4;

      cage.cells.forEach((cell) => {
        mapping.set(cell, ci);
        const r = Math.floor(cell / 4);
        const c = cell % 4;
        if (r < labelRow || (r === labelRow && c < labelCol)) {
          labelCell = cell;
          labelRow = r;
          labelCol = c;
        }
      });

      labels.set(ci, labelCell);
    });

    return { cellToCage: mapping, cageLabelCell: labels };
  }, [store.puzzle]);

  // ---------------------------------------------------------------------------
  // Cage border helper: determine thick borders for a cell
  // ---------------------------------------------------------------------------

  function getCageBorders(cellIndex: number): React.CSSProperties {
    const myCage = cellToCage.get(cellIndex);
    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;

    const thin = "1px solid rgba(148, 163, 184, 0.3)"; // slate-400/30
    const thick = "3px solid #0891B2"; // cyan-600

    // Top border
    const topNeighbor = row > 0 ? cellIndex - 4 : -1;
    const borderTop =
      row === 0 || cellToCage.get(topNeighbor) !== myCage ? thick : thin;

    // Bottom border
    const bottomNeighbor = row < 3 ? cellIndex + 4 : -1;
    const borderBottom =
      row === 3 || cellToCage.get(bottomNeighbor) !== myCage ? thick : thin;

    // Left border
    const leftNeighbor = col > 0 ? cellIndex - 1 : -1;
    const borderLeft =
      col === 0 || cellToCage.get(leftNeighbor) !== myCage ? thick : thin;

    // Right border
    const rightNeighbor = col < 3 ? cellIndex + 1 : -1;
    const borderRight =
      col === 3 || cellToCage.get(rightNeighbor) !== myCage ? thick : thin;

    return { borderTop, borderBottom, borderLeft, borderRight };
  }

  // ---------------------------------------------------------------------------
  // Get the cage label text for a cell (only if it's the label cell)
  // ---------------------------------------------------------------------------

  function getCageLabel(cellIndex: number): string | null {
    if (!store.puzzle) return null;
    const cageIndex = cellToCage.get(cellIndex);
    if (cageIndex === undefined) return null;
    if (cageLabelCell.get(cageIndex) !== cellIndex) return null;

    const cage = store.puzzle.cages[cageIndex];
    if (cage.operation === "") {
      return `${cage.target}`;
    }
    return `${cage.target}${cage.operation}`;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex h-full flex-col items-center justify-center gap-6 p-8 outline-none"
    >
      {/* Timer */}
      <div className="font-mono text-2xl" style={{ color: "#0891B2" }}>
        {formatTime(timer.time)}
      </div>

      {/* 4x4 Grid */}
      <div
        className="relative grid grid-cols-4"
        style={{ borderRadius: "8px", overflow: "hidden" }}
      >
        {store.playerGrid.map((value, i) => {
          const isSelected = store.selectedCell === i;
          const hasError = store.errors.has(i);
          const label = getCageLabel(i);
          const cageBorders = getCageBorders(i);

          return (
            <button
              key={i}
              onClick={() => store.selectCell(i)}
              className="relative flex items-center justify-center text-xl font-bold transition-colors sm:text-2xl"
              style={{
                width: "72px",
                height: "72px",
                ...cageBorders,
                backgroundColor: isSelected
                  ? "rgba(8, 145, 178, 0.15)"
                  : "transparent",
                color: hasError ? "#F43F5E" : "#0891B2",
                cursor: "pointer",
              }}
            >
              {/* Cage label */}
              {label && (
                <span
                  className="absolute font-semibold leading-none"
                  style={{
                    top: "3px",
                    left: "4px",
                    fontSize: "11px",
                    color: "#94A3B8",
                    pointerEvents: "none",
                  }}
                >
                  {label}
                </span>
              )}

              {/* Cell value */}
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
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface text-lg font-bold text-foreground transition-all hover:text-[#0891B2]"
            style={{
              borderColor: undefined,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget.style.borderColor = "#0891B2");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.style.borderColor = "");
            }}
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
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted transition-all hover:border-red-400 hover:text-red-400"
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
