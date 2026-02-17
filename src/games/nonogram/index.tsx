"use client";

import { useEffect, useRef, useCallback } from "react";
import { useNonogramStore } from "./store";
import { useTimer } from "@/games/_shared/use-timer";
import { formatTime } from "@/lib/utils";
import type { GameState, GameCallbacks } from "@/types/game";

interface NonogramProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const ACCENT = "#DB2777";

export default function Nonogram({
  gameState,
  score,
  setScore,
  callbacks,
}: NonogramProps) {
  const store = useNonogramStore();
  const timer = useTimer();
  const accumulatedScoreRef = useRef(0);
  const hasInitRef = useRef(false);

  // Initialize on play
  useEffect(() => {
    if (gameState === "playing" && !hasInitRef.current) {
      hasInitRef.current = true;
      accumulatedScoreRef.current = 0;
      setScore(0);
      store.initPuzzle();
      timer.reset();
      timer.start();
    } else if (gameState === "playing" && hasInitRef.current) {
      // Resuming from pause
      timer.start();
    } else if (gameState === "paused") {
      timer.stop();
    } else if (gameState === "idle" || gameState === "gameover") {
      hasInitRef.current = false;
      timer.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Handle completion
  useEffect(() => {
    if (!store.isComplete || gameState !== "playing") return;

    timer.stop();

    // Score: time-based — faster = higher score
    // Base 1000 per level, minus time penalty (10 pts per second), minimum 100
    const levelScore = Math.max(1000 - timer.time * 10, 100);
    accumulatedScoreRef.current += levelScore;
    setScore(accumulatedScoreRef.current);

    // Advance to next puzzle after brief delay
    setTimeout(() => {
      const s = useNonogramStore.getState();
      if (!s.isComplete) return; // guard against stale timeout

      useNonogramStore.setState({ level: s.level + 1, isComplete: false });
      store.initPuzzle();
      timer.reset();
      timer.start();
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isComplete]);

  const handleCellClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (gameState !== "playing" || store.isComplete) return;

      if (e.shiftKey) {
        store.toggleMark(index);
      } else {
        store.toggleFill(index);
      }
    },
    [gameState, store]
  );

  const handleContextMenu = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (gameState !== "playing" || store.isComplete) return;
      store.toggleMark(index);
    },
    [gameState, store]
  );

  const puzzle = store.puzzle;
  if (!puzzle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted text-sm">Waiting to start...</p>
      </div>
    );
  }

  const { size, rowClues, colClues } = puzzle;

  // Determine the max number of clue values in any column (for top clue height)
  const maxColClueLen = Math.max(...colClues.map((c) => c.length));
  // Determine the max number of clue values in any row (for left clue width)
  const maxRowClueLen = Math.max(...rowClues.map((c) => c.length));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 select-none">
      {/* Header: timer + level + score */}
      <div className="flex items-center gap-6 text-sm font-mono">
        <span className="text-muted">
          Time{" "}
          <span className="font-bold text-base" style={{ color: ACCENT }}>
            {formatTime(timer.time)}
          </span>
        </span>
        <span className="text-muted">
          Level{" "}
          <span className="font-bold text-base" style={{ color: ACCENT }}>
            {store.level}
          </span>
        </span>
        <span className="text-muted">
          Score{" "}
          <span className="font-bold text-base" style={{ color: ACCENT }}>
            {score}
          </span>
        </span>
      </div>

      {/* Nonogram grid with clues */}
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `${maxRowClueLen * 1.2}rem repeat(${size}, 2.75rem)`,
          gridTemplateRows: `${maxColClueLen * 1.2}rem repeat(${size}, 2.75rem)`,
          gap: "0px",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top-left empty corner */}
        <div />

        {/* Column clues (top row) */}
        {colClues.map((clue, c) => (
          <div
            key={`col-clue-${c}`}
            className="flex flex-col items-center justify-end pb-1"
          >
            {clue.map((num, i) => (
              <span
                key={i}
                className="text-xs font-mono font-semibold leading-tight text-muted-foreground"
              >
                {num}
              </span>
            ))}
          </div>
        ))}

        {/* Rows: row clue + cells */}
        {Array.from({ length: size }, (_, r) => (
          <RowFragment
            key={`row-${r}`}
            row={r}
            size={size}
            rowClue={rowClues[r]}
            maxRowClueLen={maxRowClueLen}
            playerGrid={store.playerGrid}
            markedEmpty={store.markedEmpty}
            isComplete={store.isComplete}
            onCellClick={handleCellClick}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* Completion flash */}
      {store.isComplete && (
        <div className="animate-pulse text-center">
          <p className="text-lg font-bold" style={{ color: ACCENT }}>
            Puzzle complete! +{Math.max(1000 - timer.time * 10, 100)} pts
          </p>
          <p className="text-xs text-muted mt-1">Loading next puzzle...</p>
        </div>
      )}

      {/* Instructions */}
      {!store.isComplete && (
        <p className="text-xs text-muted text-center max-w-xs">
          Click to fill a cell. Right-click or Shift+click to mark as empty (X).
          Match the pattern described by the row and column clues.
        </p>
      )}
    </div>
  );
}

// Extracted row fragment to keep the grid layout flat
interface RowFragmentProps {
  row: number;
  size: number;
  rowClue: number[];
  maxRowClueLen: number;
  playerGrid: boolean[];
  markedEmpty: Set<number>;
  isComplete: boolean;
  onCellClick: (index: number, e: React.MouseEvent) => void;
  onContextMenu: (index: number, e: React.MouseEvent) => void;
}

function RowFragment({
  row,
  size,
  rowClue,
  playerGrid,
  markedEmpty,
  isComplete,
  onCellClick,
  onContextMenu,
}: RowFragmentProps) {
  return (
    <>
      {/* Row clue */}
      <div className="flex items-center justify-end gap-1 pr-2">
        {rowClue.map((num, i) => (
          <span
            key={i}
            className="text-xs font-mono font-semibold text-muted-foreground"
          >
            {num}
          </span>
        ))}
      </div>

      {/* Cells */}
      {Array.from({ length: size }, (_, c) => {
        const idx = row * size + c;
        const filled = playerGrid[idx];
        const marked = markedEmpty.has(idx);

        return (
          <button
            key={idx}
            onClick={(e) => onCellClick(idx, e)}
            onContextMenu={(e) => onContextMenu(idx, e)}
            disabled={isComplete}
            className="relative flex items-center justify-center transition-all duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-pink-400/50"
            style={{
              width: "2.75rem",
              height: "2.75rem",
              backgroundColor: filled ? ACCENT : "rgba(26, 26, 46, 0.8)",
              borderTop: row === 0 ? "2px solid #3a3a5e" : "1px solid #2a2a3e",
              borderLeft:
                c === 0 ? "2px solid #3a3a5e" : "1px solid #2a2a3e",
              borderRight:
                c === size - 1 ? "2px solid #3a3a5e" : "1px solid #2a2a3e",
              borderBottom:
                row === size - 1
                  ? "2px solid #3a3a5e"
                  : "1px solid #2a2a3e",
              boxShadow: filled
                ? `0 0 12px rgba(219, 39, 119, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
                : "inset 0 1px 3px rgba(0,0,0,0.2)",
            }}
            aria-label={`Row ${row + 1}, Column ${c + 1}: ${filled ? "filled" : marked ? "marked empty" : "empty"}`}
          >
            {/* Filled cell inner glow */}
            {filled && (
              <span
                className="absolute inset-1 rounded-sm"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                }}
              />
            )}
            {/* X mark for explicitly empty */}
            {marked && !filled && (
              <span
                className="text-sm font-bold select-none"
                style={{ color: "rgba(219, 39, 119, 0.5)" }}
              >
                X
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
