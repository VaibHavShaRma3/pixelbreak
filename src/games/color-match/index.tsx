"use client";

import { useEffect, useState } from "react";
import { useColorMatchStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface ColorMatchProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function ColorMatch({
  gameState,
  setScore,
  callbacks,
}: ColorMatchProps) {
  const store = useColorMatchStore();
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      store.generateRound();
    }
  }, [gameState]);

  useEffect(() => {
    if (store.round > store.totalRounds && gameState === "playing") {
      const finalScore = Math.round(
        (store.correct / store.totalRounds) * 100
      );
      callbacks.onGameEnd(finalScore);
    }
  }, [store.round, store.totalRounds, store.correct, gameState, callbacks]);

  const handleAnswer = (index: number) => {
    if (gameState !== "playing" || feedback) return;

    const isCorrect = store.recordAnswer(index);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev: number) => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      if (store.round < store.totalRounds) {
        store.generateRound();
      }
    }, 400);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      {/* Round indicator */}
      <div className="text-sm text-muted">
        Round {Math.min(store.round, store.totalRounds)} / {store.totalRounds}
      </div>

      {/* Target: color name displayed in a misleading color */}
      <div className="text-center">
        <p className="text-sm text-muted mb-2">What color is this word?</p>
        <h2
          className="font-[family-name:var(--font-pixel)] text-3xl"
          style={{ color: store.targetDisplayColor }}
        >
          {store.targetColorName}
        </h2>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-sm font-bold ${
            feedback === "correct" ? "text-neon-green" : "text-neon-pink"
          }`}
        >
          {feedback === "correct" ? "Correct!" : "Wrong!"}
        </div>
      )}

      {/* Answer options (color swatches) */}
      <div className="grid grid-cols-2 gap-4">
        {store.options.map((opt, i) => (
          <button
            key={`${store.round}-${i}`}
            onClick={() => handleAnswer(i)}
            className="flex h-24 w-32 items-center justify-center rounded-xl border-2 border-border transition-all hover:scale-105 hover:border-white/30 active:scale-95"
            style={{ backgroundColor: opt.hex }}
          >
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {opt.name}
            </span>
          </button>
        ))}
      </div>

      {/* Score bar */}
      <div className="flex gap-6 text-sm">
        <span className="text-neon-green">Correct: {store.correct}</span>
        <span className="text-neon-pink">Wrong: {store.wrong}</span>
      </div>
    </div>
  );
}
