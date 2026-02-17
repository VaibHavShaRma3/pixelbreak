"use client";

import { useEffect, useRef, useState } from "react";
import { useSequenceSolverStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface SequenceSolverProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function SequenceSolver({
  gameState,
  score,
  setScore,
  callbacks,
}: SequenceSolverProps) {
  const store = useSequenceSolverStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalScoreRef = useRef(0);

  // Keep totalScoreRef in sync with score prop
  useEffect(() => {
    totalScoreRef.current = score;
  }, [score]);

  // Init game when gameState changes to "playing"
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
      totalScoreRef.current = 0;
      store.initGame();
    }
  }, [gameState]);

  // Focus input when round changes
  useEffect(() => {
    if (gameState === "playing" && store.round > 0) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [store.round, gameState]);

  // Check if game is over after round advances
  useEffect(() => {
    if (store.round > store.totalRounds && gameState === "playing") {
      callbacks.onGameEnd(totalScoreRef.current);
    }
  }, [store.round, store.totalRounds, gameState, callbacks]);

  const handleSubmit = () => {
    if (gameState !== "playing" || store.feedback || isTransitioning) return;

    const isCorrect = store.submitAnswer();
    setIsTransitioning(true);

    if (isCorrect && store.currentSequence) {
      setScore((prev: number) => prev + store.currentSequence!.points);
    }

    setTimeout(() => {
      store.nextRound();
      setIsTransitioning(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const sequence = store.currentSequence;
  const difficultyLabel =
    sequence?.difficulty === 1
      ? "Easy"
      : sequence?.difficulty === 2
        ? "Medium"
        : "Hard";
  const difficultyColor =
    sequence?.difficulty === 1
      ? "text-green-400"
      : sequence?.difficulty === 2
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      {/* Round counter and difficulty */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">
          Round {Math.min(store.round, store.totalRounds)} / {store.totalRounds}
        </span>
        {sequence && (
          <>
            <span className="text-muted">|</span>
            <span className={`text-sm font-semibold ${difficultyColor}`}>
              {difficultyLabel}
            </span>
            <span className="text-muted">|</span>
            <span className="text-sm text-muted">
              +{sequence.points} pts
            </span>
          </>
        )}
      </div>

      {/* Score display */}
      <div
        className="text-3xl font-bold font-mono"
        style={{ color: "#7C3AED" }}
      >
        {score}
      </div>

      {/* Sequence numbers */}
      {sequence && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {sequence.numbers.map((num, i) => (
            <div
              key={`${store.round}-${i}`}
              className="flex h-14 w-14 items-center justify-center rounded-lg border-2 text-lg font-bold sm:h-16 sm:w-16 sm:text-xl"
              style={{
                borderColor: "#7C3AED",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                color: "#e2e8f0",
              }}
            >
              {num}
            </div>
          ))}

          {/* The mystery box */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed text-2xl font-bold sm:h-16 sm:w-16"
            style={{
              borderColor: "#7C3AED",
              backgroundColor: "rgba(124, 58, 237, 0.05)",
              color: "#7C3AED",
            }}
          >
            ?
          </div>
        </div>
      )}

      {/* Hint text */}
      {sequence && (
        <p className="text-sm text-muted italic max-w-md text-center">
          {sequence.hint}
        </p>
      )}

      {/* Input and submit */}
      {sequence && (
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="number"
            value={store.input}
            onChange={(e) => store.setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!!store.feedback || isTransitioning}
            placeholder="Your answer"
            className="h-12 w-36 rounded-lg border-2 bg-transparent px-4 text-center text-lg font-bold text-foreground outline-none transition-colors focus:border-opacity-100 disabled:opacity-50"
            style={{
              borderColor: store.feedback === "correct"
                ? "#22c55e"
                : store.feedback === "wrong"
                  ? "#ef4444"
                  : "#7C3AED",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={
              !!store.feedback || isTransitioning || store.input.trim() === ""
            }
            className="h-12 rounded-lg px-6 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#7C3AED" }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Feedback */}
      {store.feedback && (
        <div
          className={`text-lg font-bold transition-all ${
            store.feedback === "correct"
              ? "text-green-400 animate-pulse"
              : "text-red-400 animate-[shake_0.3s_ease-in-out]"
          }`}
        >
          {store.feedback === "correct" ? (
            <span>
              Correct! The answer is{" "}
              <span className="font-mono">{sequence?.answer}</span>
            </span>
          ) : (
            <span>
              Wrong! The answer was{" "}
              <span className="font-mono">{sequence?.answer}</span>
            </span>
          )}
        </div>
      )}

      {/* Keyboard hint */}
      <p className="text-xs text-muted">
        Type your answer and press Enter to submit.
      </p>
    </div>
  );
}
