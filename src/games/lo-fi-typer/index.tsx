"use client";

import { useEffect, useCallback, useRef } from "react";
import { useLoFiTyperStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface LoFiTyperProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "pixel art is a form of digital art",
  "every game starts with a single line of code",
  "press start to begin your adventure",
  "high scores are made one point at a time",
];

const TOTAL_SENTENCES = SENTENCES.length;

export default function LoFiTyper({
  gameState,
  score,
  setScore,
  callbacks,
}: LoFiTyperProps) {
  const {
    currentSentenceIndex,
    typedChars,
    combo,
    maxCombo,
    mistakes,
    nextSentence,
    incrementTyped,
    incrementCombo,
    breakCombo,
    addMistake,
    reset,
  } = useLoFiTyperStore();

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const storeRef = useRef({
    currentSentenceIndex,
    typedChars,
    combo,
  });
  storeRef.current = { currentSentenceIndex, typedChars, combo };

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
    }
  }, [gameState, reset, setScore]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStateRef.current !== "playing") return;
      if (e.key.length !== 1 && e.key !== " ") return; // Only process printable chars
      e.preventDefault();

      const { currentSentenceIndex: sentIdx, typedChars: typed, combo: currentCombo } =
        storeRef.current;
      if (sentIdx >= TOTAL_SENTENCES) return;

      const currentSentence = SENTENCES[sentIdx];
      const expectedChar = currentSentence[typed];

      if (e.key === expectedChar) {
        incrementTyped();
        incrementCombo();
        // Score = combo value (current combo + 1 since incrementCombo hasn't updated ref yet)
        setScore((prev: number) => prev + (currentCombo + 1));

        // Check if sentence is complete
        if (typed + 1 >= currentSentence.length) {
          // Move to next sentence
          if (sentIdx + 1 >= TOTAL_SENTENCES) {
            // Game over after a brief delay
            setTimeout(() => {
              callbacks.onGameEnd(scoreRef.current);
            }, 500);
          } else {
            nextSentence();
          }
        }
      } else {
        breakCombo();
        addMistake();
      }
    },
    [incrementTyped, incrementCombo, breakCombo, addMistake, nextSentence, setScore, callbacks]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentSentence =
    currentSentenceIndex < TOTAL_SENTENCES
      ? SENTENCES[currentSentenceIndex]
      : "";
  const isFinished = currentSentenceIndex >= TOTAL_SENTENCES;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
      {/* Combo display */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">Combo</p>
        <p
          className="text-5xl font-bold transition-all"
          style={{
            color: combo > 0 ? "#00fff5" : "#666",
            textShadow: combo > 10 ? "0 0 20px #00fff5" : "none",
            transform: combo > 20 ? "scale(1.1)" : "scale(1)",
          }}
        >
          {combo}x
        </p>
        <p className="text-xs text-text-secondary mt-1">
          Max: {maxCombo}x | Mistakes: {mistakes}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {SENTENCES.map((_, i) => (
          <div
            key={i}
            className="h-2 w-8 rounded-full"
            style={{
              backgroundColor:
                i < currentSentenceIndex
                  ? "#00fff5"
                  : i === currentSentenceIndex
                  ? "#00fff580"
                  : "#333",
            }}
          />
        ))}
      </div>

      {/* Sentence display */}
      <div className="max-w-lg text-center">
        {isFinished ? (
          <p className="text-2xl font-bold" style={{ color: "#00fff5" }}>
            Complete!
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-0 text-2xl font-mono leading-relaxed">
            {currentSentence.split("").map((char, i) => {
              let colorClass = "text-text-secondary opacity-40";
              if (i < typedChars) {
                colorClass = "text-green-400"; // correctly typed
              } else if (i === typedChars) {
                colorClass = "text-white"; // current char
              }

              return (
                <span
                  key={i}
                  className={`relative ${colorClass} transition-colors duration-75`}
                >
                  {char === " " ? "\u00A0" : char}
                  {i === typedChars && (
                    <span
                      className="absolute bottom-0 left-0 h-0.5 w-full"
                      style={{
                        backgroundColor: "#00fff5",
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">Score</p>
        <p className="text-xl font-bold text-text-primary">{score}</p>
      </div>

      {/* Blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
