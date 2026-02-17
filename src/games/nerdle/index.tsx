"use client";

import { useEffect, useRef, useCallback } from "react";
import { useNerdleStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface NerdleProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const KEYBOARD_ROWS = [
  ["1", "2", "3", "4", "5"],
  ["6", "7", "8", "9", "0"],
  ["+", "-", "*", "/", "="],
  ["Enter", "Backspace"],
];

const VALID_INPUT_CHARS = "0123456789+-*/=";

const ACCENT = "#7C3AED";

function getCellBg(result: string): string {
  switch (result) {
    case "correct":
      return "#22c55e";
    case "present":
      return "#eab308";
    case "absent":
      return "#333333";
    default:
      return "transparent";
  }
}

function getCellBorder(result: string): string {
  switch (result) {
    case "correct":
      return "#22c55e";
    case "present":
      return "#eab308";
    case "absent":
      return "#333333";
    default:
      return "#555555";
  }
}

export default function Nerdle({
  gameState,
  setScore,
  callbacks,
}: NerdleProps) {
  const store = useNerdleStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;
  const gameEndCalledRef = useRef(false);

  // Init game when playing begins
  useEffect(() => {
    if (gameState === "playing") {
      store.initGame();
      gameEndCalledRef.current = false;
      containerRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Handle game end
  const handleGameEnd = useCallback(
    (won: boolean, guessCount: number) => {
      if (gameEndCalledRef.current) return;
      gameEndCalledRef.current = true;

      const finalScore = won ? (7 - guessCount) * 200 : 50;
      setScore(finalScore);
      // Small delay so the player can see the final row result
      setTimeout(() => {
        callbacks.onGameEnd(finalScore);
      }, 1200);
    },
    [setScore, callbacks]
  );

  // Physical keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = storeRef.current;
      if (s.gameOver) return;

      if (e.key === "Enter") {
        e.preventDefault();
        const result = s.submitGuess();
        if (result.valid) {
          const guessCount = storeRef.current.guesses.length;
          if (result.won) {
            handleGameEnd(true, guessCount);
          } else if (guessCount >= s.maxGuesses) {
            handleGameEnd(false, guessCount);
          }
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        s.removeChar();
      } else if (VALID_INPUT_CHARS.includes(e.key)) {
        e.preventDefault();
        s.addChar(e.key);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleGameEnd]);

  // Virtual keyboard press handler
  const handleVirtualKey = (key: string) => {
    if (store.gameOver) return;

    if (key === "Enter") {
      const result = store.submitGuess();
      if (result.valid) {
        // Re-read from store after submit
        const currentStore = useNerdleStore.getState();
        const guessCount = currentStore.guesses.length;
        if (result.won) {
          handleGameEnd(true, guessCount);
        } else if (guessCount >= currentStore.maxGuesses) {
          handleGameEnd(false, guessCount);
        }
      }
    } else if (key === "Backspace") {
      store.removeChar();
    } else {
      store.addChar(key);
    }
  };

  // Build the grid rows
  const rows = [];
  for (let r = 0; r < store.maxGuesses; r++) {
    if (r < store.guesses.length) {
      // Submitted guess row
      rows.push({ type: "submitted" as const, row: r });
    } else if (r === store.guesses.length && !store.gameOver) {
      // Current input row
      rows.push({ type: "current" as const, row: r });
    } else {
      // Empty future row
      rows.push({ type: "empty" as const, row: r });
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex h-full flex-col items-center justify-center gap-4 p-4 outline-none sm:gap-6 sm:p-8"
    >
      {/* Title accent */}
      <div className="text-sm font-bold tracking-widest" style={{ color: ACCENT }}>
        NERDLE
      </div>

      {/* Message / error feedback */}
      <div className="h-6 text-sm font-medium">
        {store.message && (
          <span className="text-red-400 animate-pulse">{store.message}</span>
        )}
        {store.gameOver && store.won && (
          <span className="text-green-400 font-bold">You got it!</span>
        )}
        {store.gameOver && !store.won && (
          <span className="text-red-400">
            Answer: <span className="font-mono font-bold text-white">{store.answer}</span>
          </span>
        )}
      </div>

      {/* Grid: 6 rows x 8 columns */}
      <div className="flex flex-col gap-1.5">
        {rows.map(({ type, row }) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: 8 }).map((_, col) => {
              let char = "";
              let result = "empty";

              if (type === "submitted") {
                char = store.guesses[row][col];
                result = store.results[row][col];
              } else if (type === "current") {
                char = store.currentGuess[col] ?? "";
              }

              const isCursor =
                type === "current" && col === store.currentGuess.length;

              return (
                <div
                  key={col}
                  className="flex h-11 w-11 items-center justify-center rounded-md border-2 text-lg font-bold font-mono transition-all duration-300 sm:h-14 sm:w-14 sm:text-xl"
                  style={{
                    backgroundColor: getCellBg(result),
                    borderColor:
                      isCursor
                        ? ACCENT
                        : type === "current" && char
                          ? "#888888"
                          : getCellBorder(result),
                    color:
                      result === "empty" ? "#e5e5e5" : "#ffffff",
                    boxShadow:
                      isCursor ? `0 0 8px ${ACCENT}55` : "none",
                  }}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Virtual Keyboard */}
      <div className="flex flex-col items-center gap-1.5 mt-2">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((key) => {
              const charStatus = store.usedChars[key];
              const isAction = key === "Enter" || key === "Backspace";

              let bgColor = "#444444";
              let textColor = "#e5e5e5";

              if (!isAction && charStatus) {
                bgColor = getCellBg(charStatus);
                textColor = "#ffffff";
              }

              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKey(key)}
                  className="flex items-center justify-center rounded-md font-bold font-mono transition-all active:scale-95 select-none"
                  style={{
                    backgroundColor: isAction ? ACCENT : bgColor,
                    color: isAction ? "#ffffff" : textColor,
                    minWidth: isAction ? "5rem" : "2.5rem",
                    height: "2.75rem",
                    fontSize: isAction ? "0.75rem" : "1rem",
                  }}
                >
                  {key === "Backspace" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" />
                      <line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  ) : key === "Enter" ? (
                    "ENTER"
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Type a valid 8-char equation (e.g. 12+34=46) and press Enter
      </p>
    </div>
  );
}
