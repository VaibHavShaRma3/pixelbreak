"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useDailyPixelPuzzleStore } from "./store";
import { getPuzzle, getPuzzleCount } from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface DailyPixelPuzzleProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const GRID_SIZE = 8;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
const START_SCORE = 100;

export default function DailyPixelPuzzle({
  gameState,
  score,
  setScore,
  callbacks,
}: DailyPixelPuzzleProps) {
  const {
    revealedTiles,
    currentPuzzleIndex,
    guessed,
    revealTile,
    setPuzzleIndex,
    setGuessed,
    setCorrectAnswer,
    reset,
  } = useDailyPixelPuzzleStore();

  const puzzle = useMemo(
    () => getPuzzle(currentPuzzleIndex),
    [currentPuzzleIndex]
  );

  // Initialize game
  useEffect(() => {
    if (gameState === "playing") {
      const randomIndex = Math.floor(Math.random() * getPuzzleCount());
      setPuzzleIndex(randomIndex);
      setCorrectAnswer(getPuzzle(randomIndex).name);
      reset();
      setScore(START_SCORE);
    }
  }, [gameState, reset, setPuzzleIndex, setCorrectAnswer, setScore]);

  // Auto-end if all tiles revealed without guessing
  useEffect(() => {
    if (
      gameState === "playing" &&
      revealedTiles.size >= TOTAL_TILES &&
      !guessed
    ) {
      setGuessed(true);
      // Reveal all, no bonus - just end
      callbacks.onGameEnd(score);
    }
  }, [revealedTiles.size, gameState, guessed, score, callbacks, setGuessed]);

  const handleReveal = useCallback(
    (index: number) => {
      if (gameState !== "playing" || guessed || revealedTiles.has(index)) return;
      revealTile(index);
      setScore((prev: number) => Math.max(0, prev - 1));
    },
    [gameState, guessed, revealedTiles, revealTile, setScore]
  );

  const handleGuess = useCallback(
    (option: string) => {
      if (gameState !== "playing" || guessed) return;
      setGuessed(true);
      if (option === puzzle.name) {
        setScore((prev: number) => prev + 50);
        // Small delay so the user sees the score change
        setTimeout(() => {
          callbacks.onGameEnd(score + 50);
        }, 800);
      } else {
        setScore((prev: number) => Math.max(0, prev - 20));
        setTimeout(() => {
          callbacks.onGameEnd(Math.max(0, score - 20));
        }, 800);
      }
    },
    [gameState, guessed, puzzle.name, score, setScore, callbacks, setGuessed]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Score display */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">Score</p>
        <p className="text-3xl font-bold" style={{ color: "#ffe600" }}>
          {score}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {revealedTiles.size} / {TOTAL_TILES} tiles revealed
        </p>
      </div>

      {/* 8x8 Grid */}
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          maxWidth: "320px",
          width: "100%",
        }}
      >
        {Array.from({ length: TOTAL_TILES }, (_, i) => {
          const row = Math.floor(i / GRID_SIZE);
          const col = i % GRID_SIZE;
          const isRevealed = revealedTiles.has(i);
          const color = puzzle.grid[row][col];

          return (
            <button
              key={i}
              onClick={() => handleReveal(i)}
              className="aspect-square rounded-sm transition-all duration-150"
              style={{
                backgroundColor: isRevealed ? color : "#333333",
                border: isRevealed
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(255,255,255,0.05)",
                cursor:
                  gameState === "playing" && !guessed && !isRevealed
                    ? "pointer"
                    : "default",
              }}
              disabled={isRevealed || guessed || gameState !== "playing"}
              aria-label={`Tile ${row},${col}${isRevealed ? " (revealed)" : ""}`}
            />
          );
        })}
      </div>

      {/* Guess buttons */}
      {gameState === "playing" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-text-secondary">
            {guessed ? (
              <span
                style={{
                  color:
                    revealedTiles.size < TOTAL_TILES ? "#ffe600" : "#888",
                }}
              >
                {guessed ? "Guess submitted!" : ""}
              </span>
            ) : (
              "What is this pixel art?"
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {puzzle.options.map((option) => (
              <button
                key={option}
                onClick={() => handleGuess(option)}
                disabled={guessed || gameState !== "playing"}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  guessed
                    ? option === puzzle.name
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-border bg-surface-2 text-text-secondary opacity-50"
                    : "border-border bg-surface-2 text-text-primary hover:border-[#ffe600] hover:bg-[#ffe600]/10 cursor-pointer"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
