"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMagneticPoetryStore, type MagnetWord } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface MagneticPoetryProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function MagneticPoetry({
  gameState,
  score,
  setScore,
  callbacks,
}: MagneticPoetryProps) {
  const { words, wordsOnBoard, moveWordToBoard, moveWord, shuffleWords, reset } =
    useMagneticPoetryStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
    fromTray: boolean;
  } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
    }
  }, [gameState, reset, setScore]);

  // Sync score with words on board
  useEffect(() => {
    setScore(wordsOnBoard);
  }, [wordsOnBoard, setScore]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, word: MagnetWord, fromTray: boolean) => {
      if (gameState !== "playing") return;
      e.preventDefault();

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      setDragging({ id: word.id, offsetX, offsetY, fromTray });
      setDragPos({ x: e.clientX, y: e.clientY });
    },
    [gameState]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setDragPos({ x: e.clientX, y: e.clientY });
    },
    [dragging]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;

      const board = boardRef.current;
      if (board) {
        const boardRect = board.getBoundingClientRect();
        const x = e.clientX - boardRect.left - dragging.offsetX;
        const y = e.clientY - boardRect.top - dragging.offsetY;

        // Check if dropped on the board
        if (
          e.clientX >= boardRect.left &&
          e.clientX <= boardRect.right &&
          e.clientY >= boardRect.top &&
          e.clientY <= boardRect.bottom
        ) {
          // Clamp position within board bounds
          const clampedX = Math.max(0, Math.min(boardRect.width - 60, x));
          const clampedY = Math.max(0, Math.min(boardRect.height - 30, y));

          if (dragging.fromTray) {
            moveWordToBoard(dragging.id, clampedX, clampedY);
          } else {
            moveWord(dragging.id, clampedX, clampedY);
          }
        }
      }

      setDragging(null);
    },
    [dragging, moveWordToBoard, moveWord]
  );

  const handleFinish = useCallback(() => {
    callbacks.onGameEnd(wordsOnBoard);
  }, [callbacks, wordsOnBoard]);

  const boardWords = words.filter((w) => w.onBoard);
  const trayWords = words.filter((w) => !w.onBoard);
  const draggedWord = dragging ? words.find((w) => w.id === dragging.id) : null;

  return (
    <div
      className="flex h-full flex-col items-center gap-3 p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Fridge board */}
      <div
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-lg border-2 border-border"
        style={{
          minHeight: "400px",
          maxWidth: "500px",
          background:
            "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* Subtle fridge texture overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
          }}
        />

        {/* Words on board */}
        {boardWords.map((word) => (
          <div
            key={word.id}
            onMouseDown={(e) => handleMouseDown(e, word, false)}
            className="absolute cursor-grab select-none rounded px-2 py-1 text-sm font-medium shadow-md transition-shadow active:cursor-grabbing active:shadow-lg"
            style={{
              left: word.x,
              top: word.y,
              background: "rgba(255, 255, 255, 0.92)",
              color: "#1a1a2e",
              border: "1px solid rgba(0,0,0,0.15)",
              userSelect: "none",
              zIndex: dragging?.id === word.id ? 50 : 10,
            }}
          >
            {word.text}
          </div>
        ))}

        {/* Empty state */}
        {boardWords.length === 0 && (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <p className="text-sm text-muted/40">
              Drag words here to create your poem
            </p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted">
          Words placed:{" "}
          <span className="font-bold text-[#b026ff]">{wordsOnBoard}</span>
        </div>

        <button
          onClick={shuffleWords}
          className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-all hover:bg-surface-2/80"
        >
          New Words
        </button>

        {gameState === "playing" && (
          <button
            onClick={handleFinish}
            className="rounded-lg border border-[#b026ff] bg-[#b026ff]/10 px-4 py-1.5 text-sm font-medium text-[#b026ff] transition-all hover:bg-[#b026ff]/20"
          >
            Finish
          </button>
        )}
      </div>

      {/* Word tray */}
      <div
        className="w-full max-w-[500px] overflow-x-auto rounded-lg border border-border bg-surface-2 p-3"
        style={{ maxHeight: "140px" }}
      >
        <div className="flex flex-wrap gap-2">
          {trayWords.map((word) => (
            <div
              key={word.id}
              onMouseDown={(e) => handleMouseDown(e, word, true)}
              className="cursor-grab select-none rounded px-2 py-1 text-sm font-medium shadow-sm transition-all hover:shadow-md active:cursor-grabbing"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                color: "#1a1a2e",
                border: "1px solid rgba(0,0,0,0.12)",
                userSelect: "none",
              }}
            >
              {word.text}
            </div>
          ))}
        </div>
      </div>

      {/* Drag ghost */}
      {dragging && draggedWord && (
        <div
          className="pointer-events-none fixed z-[100] rounded px-2 py-1 text-sm font-medium shadow-lg"
          style={{
            left: dragPos.x - dragging.offsetX,
            top: dragPos.y - dragging.offsetY,
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1a1a2e",
            border: "1px solid #b026ff",
            transform: "rotate(-2deg) scale(1.05)",
          }}
        >
          {draggedWord.text}
        </div>
      )}
    </div>
  );
}
