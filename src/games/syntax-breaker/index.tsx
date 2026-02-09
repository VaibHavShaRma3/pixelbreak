"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSyntaxBreakerStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface SyntaxBreakerProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

interface CodeLevel {
  lines: string[];
  errorLine: number; // 0-indexed
  errorText: string;
  fixedText: string;
  options: string[];
  correctIndex: number;
  language: string;
}

const LEVELS: CodeLevel[] = [
  {
    language: "JavaScript",
    lines: [
      'function greet(name) {',
      '  console.log("Hello, " + name)',
      '  return name.toUperCase()',
      '}',
    ],
    errorLine: 2,
    errorText: "toUperCase",
    fixedText: "toUpperCase",
    options: ["toUpperCase()", "toupercase()", "ToUpperCase()"],
    correctIndex: 0,
  },
  {
    language: "Python",
    lines: [
      'def calculate(x, y):',
      '  result = x + y',
      '  retrun result',
    ],
    errorLine: 2,
    errorText: "retrun",
    fixedText: "return",
    options: ["return result", "retrun result", "returns result"],
    correctIndex: 0,
  },
  {
    language: "JavaScript",
    lines: [
      'const colors = ["red", "blue", "green"]',
      'colors.forEcah(c => {',
      '  console.log(c)',
      '})',
    ],
    errorLine: 1,
    errorText: "forEcah",
    fixedText: "forEach",
    options: ["forEach", "foreach", "for_each"],
    correctIndex: 0,
  },
  {
    language: "JavaScript",
    lines: [
      'if (score > 100) {',
      '  console.log("High score!")',
      '} esle {',
      '  console.log("Try again")',
      '}',
    ],
    errorLine: 2,
    errorText: "esle",
    fixedText: "else",
    options: ["else", "elseif", "elif"],
    correctIndex: 0,
  },
  {
    language: "JavaScript",
    lines: [
      'const user = {',
      '  name: "Player",',
      '  scroe: 42',
      '}',
      'console.log(user.score)',
    ],
    errorLine: 2,
    errorText: "scroe",
    fixedText: "score",
    options: ["score: 42", "Score: 42", "scroe: 42"],
    correctIndex: 0,
  },
];

const TOTAL_LEVELS = LEVELS.length;

// Simple syntax coloring
function colorizeToken(token: string, language: string): { color: string } {
  const keywords = [
    "function", "return", "const", "let", "var", "if", "else", "def",
    "console", "log", "import", "from", "class", "new", "this",
  ];
  const strings = /^["'`].*["'`]$/;

  if (keywords.includes(token)) return { color: "#00fff5" };
  if (strings.test(token)) return { color: "#39ff14" };
  if (token === "=>" || token === "=" || token === ">" || token === "{" || token === "}" || token === "(" || token === ")" || token === "[" || token === "]")
    return { color: "#888" };
  return { color: "#e0e0e0" };
}

export default function SyntaxBreaker({
  gameState,
  score,
  setScore,
  callbacks,
}: SyntaxBreakerProps) {
  const {
    currentLevel,
    timeLeft,
    fixedCount,
    setCurrentLevel,
    decrementTime,
    incrementFixed,
    reset,
  } = useSyntaxBreakerStore();

  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
      setSelectedLine(null);
      setFeedback(null);
      setLevelComplete(false);
    }
  }, [gameState, reset, setScore]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || levelComplete) return;

    timerRef.current = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentLevel, levelComplete, decrementTime]);

  // Check time out
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0 && !levelComplete) {
      // Time ran out for this level, move on
      setLevelComplete(true);
      if (currentLevel + 1 >= TOTAL_LEVELS) {
        setTimeout(() => callbacks.onGameEnd(scoreRef.current), 1000);
      } else {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setSelectedLine(null);
          setFeedback(null);
          setLevelComplete(false);
        }, 1500);
      }
    }
  }, [timeLeft, gameState, currentLevel, levelComplete, setCurrentLevel, callbacks]);

  const level = LEVELS[Math.min(currentLevel, TOTAL_LEVELS - 1)];

  const handleLineClick = useCallback(
    (lineIndex: number) => {
      if (gameState !== "playing" || levelComplete) return;
      setSelectedLine(lineIndex);
      setFeedback(null);
    },
    [gameState, levelComplete]
  );

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      if (gameState !== "playing" || levelComplete || selectedLine === null) return;

      if (selectedLine === level.errorLine && optionIndex === level.correctIndex) {
        // Correct fix
        setScore((prev: number) => prev + 10);
        setFeedback("correct");
        incrementFixed();
        setLevelComplete(true);

        setTimeout(() => {
          if (currentLevel + 1 >= TOTAL_LEVELS) {
            callbacks.onGameEnd(scoreRef.current + 10);
          } else {
            setCurrentLevel(currentLevel + 1);
            setSelectedLine(null);
            setFeedback(null);
            setLevelComplete(false);
          }
        }, 1200);
      } else {
        // Wrong
        setScore((prev: number) => Math.max(0, prev - 5));
        setFeedback("wrong");
        setTimeout(() => setFeedback(null), 800);
      }
    },
    [
      gameState,
      levelComplete,
      selectedLine,
      level,
      currentLevel,
      setScore,
      incrementFixed,
      setCurrentLevel,
      callbacks,
    ]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Header */}
      <div className="flex w-full max-w-lg items-center justify-between">
        <div className="text-sm text-text-secondary">
          Level{" "}
          <span className="text-[#39ff14] font-bold">
            {currentLevel + 1}
          </span>{" "}
          / {TOTAL_LEVELS}
        </div>
        <div className="text-sm">
          <span className="text-text-secondary">Time: </span>
          <span
            className="font-bold"
            style={{
              color: timeLeft <= 10 ? "#ff4444" : "#39ff14",
            }}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          Score:{" "}
          <span className="text-[#39ff14] font-bold">{score}</span>
        </div>
      </div>

      {/* Language badge */}
      <div
        className="rounded-full border px-3 py-1 text-xs font-medium"
        style={{ borderColor: "#39ff14", color: "#39ff14" }}
      >
        {level.language}
      </div>

      {/* Code block */}
      <div className="w-full max-w-lg rounded-lg border border-border bg-[#0d0d0d] p-4 font-mono text-sm">
        {level.lines.map((line, i) => {
          const isError = i === level.errorLine;
          const isSelected = i === selectedLine;

          return (
            <div
              key={i}
              onClick={() => handleLineClick(i)}
              className={`flex cursor-pointer rounded px-2 py-1 transition-all ${
                isSelected
                  ? "bg-[#39ff14]/10 border border-[#39ff14]/30"
                  : "hover:bg-white/5 border border-transparent"
              } ${
                feedback === "correct" && isError && levelComplete
                  ? "bg-green-500/10 border-green-500/30"
                  : ""
              }`}
            >
              <span className="mr-3 select-none text-text-secondary opacity-40 w-4 text-right">
                {i + 1}
              </span>
              <span>
                {isError && levelComplete && feedback === "correct" ? (
                  <span className="text-green-400">
                    {line.replace(level.errorText, level.fixedText)}
                  </span>
                ) : (
                  <span
                    className={
                      isError && isSelected
                        ? "text-red-400"
                        : "text-[#e0e0e0]"
                    }
                    style={{
                      textDecoration:
                        isError && isSelected ? "underline wavy" : "none",
                      textDecorationColor: "#ff4444",
                    }}
                  >
                    {line}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fix options */}
      {selectedLine !== null && !levelComplete && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-text-secondary">
            {selectedLine === level.errorLine
              ? "Select the correct fix:"
              : "No error on this line. Try another."}
          </p>
          {selectedLine === level.errorLine && (
            <div className="flex gap-2">
              {level.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  className={`rounded-lg border px-4 py-2 font-mono text-sm transition-all ${
                    feedback === "wrong"
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-border bg-surface-2 hover:border-[#39ff14] hover:bg-[#39ff14]/10"
                  } text-text-primary`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-sm font-bold text-green-400 animate-pulse">
          Correct! +10 points
        </p>
      )}
      {feedback === "wrong" && (
        <p className="text-sm font-bold text-red-400">
          Wrong! -5 points
        </p>
      )}
      {levelComplete && timeLeft <= 0 && feedback !== "correct" && (
        <p className="text-sm font-bold text-yellow-400">
          Time&apos;s up! Moving on...
        </p>
      )}
    </div>
  );
}
