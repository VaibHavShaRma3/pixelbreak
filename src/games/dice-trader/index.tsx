"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useDiceTraderStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface DiceTraderProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const ACCENT = "#CA8A04";
const ACCENT_GLOW = "rgba(202, 138, 4, 0.4)";
const ACCENT_BG = "rgba(202, 138, 4, 0.12)";

// Dot positions for dice faces (relative to die center, in a 3x3 grid)
// Positions: TL, TM, TR, ML, MM, MR, BL, BM, BR
const DOT_LAYOUTS: Record<number, number[][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

function DieFace({
  value,
  isLocked,
  isRolling,
  onClick,
  disabled,
}: {
  value: number;
  isLocked: boolean;
  isRolling: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const dots = value > 0 ? DOT_LAYOUTS[value] || [] : [];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center gap-1"
      style={{ cursor: disabled ? "default" : "pointer" }}
    >
      <div
        className="flex items-center justify-center rounded-xl border-2 transition-all duration-200"
        style={{
          width: 64,
          height: 64,
          borderColor: isLocked ? ACCENT : "rgba(255, 255, 255, 0.15)",
          backgroundColor: isLocked
            ? "rgba(202, 138, 4, 0.15)"
            : "rgba(255, 255, 255, 0.05)",
          boxShadow: isLocked
            ? `0 0 20px ${ACCENT_GLOW}, inset 0 0 10px rgba(202, 138, 4, 0.08)`
            : "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          animation: isRolling && !isLocked ? "diceShake 0.4s ease-in-out" : "none",
          transform: isLocked ? "scale(1.05)" : "scale(1)",
        }}
      >
        {value > 0 && (
          <div
            className="relative"
            style={{ width: 40, height: 40 }}
          >
            {dots.map(([x, y], i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: isLocked ? ACCENT : "rgba(255, 255, 255, 0.85)",
                  left: `calc(50% + ${x * 12}px - 4px)`,
                  top: `calc(50% + ${y * 12}px - 4px)`,
                  boxShadow: isLocked
                    ? `0 0 4px ${ACCENT_GLOW}`
                    : "0 0 2px rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </div>
        )}
      </div>
      {isLocked && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: ACCENT, textShadow: `0 0 6px ${ACCENT_GLOW}` }}
        >
          Held
        </span>
      )}
    </button>
  );
}

export default function DiceTrader({
  gameState,
  score,
  setScore,
  callbacks,
}: DiceTraderProps) {
  const store = useDiceTraderStore();
  const endedRef = useRef(false);
  const [showRoundResult, setShowRoundResult] = useState(false);

  // Init game on play
  useEffect(() => {
    if (gameState === "playing") {
      store.initGame();
      setScore(0);
      endedRef.current = false;
      setShowRoundResult(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Sync score
  useEffect(() => {
    if (gameState === "playing") {
      setScore(store.totalScore);
    }
  }, [store.totalScore, gameState, setScore]);

  // Flash on round end
  useEffect(() => {
    if (store.phase === "roundEnd") {
      setShowRoundResult(true);
      const timeout = setTimeout(() => setShowRoundResult(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [store.phase]);

  const handleRoll = useCallback(() => {
    if (gameState !== "playing" || store.phase !== "rolling") return;
    store.rollDice();
  }, [gameState, store]);

  const handleToggleLock = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;
      store.toggleLock(index);
    },
    [gameState, store]
  );

  const handleScore = useCallback(() => {
    if (gameState !== "playing" || store.phase !== "rolling") return;
    store.scoreTurn();
  }, [gameState, store]);

  const handleNextRound = useCallback(() => {
    if (gameState !== "playing") return;
    if (store.round >= store.totalRounds) {
      if (endedRef.current) return;
      endedRef.current = true;
      setTimeout(() => callbacks.onGameEnd(store.totalScore), 400);
    } else {
      store.nextRound();
    }
  }, [gameState, store, callbacks]);

  const isLastRound =
    store.round >= store.totalRounds && store.phase === "roundEnd";
  const canRoll =
    store.phase === "rolling" &&
    store.rollsLeft > 0 &&
    !store.isRolling &&
    store.dice.some((d) => d > 0);
  const canScore =
    store.phase === "rolling" &&
    !store.isRolling &&
    store.dice.every((d) => d > 0);

  return (
    <div className="flex h-full flex-col items-center gap-5 overflow-y-auto p-4">
      {/* Header: Round & Score */}
      <div className="flex w-full max-w-sm items-center justify-between">
        <span className="text-sm text-text-secondary">
          Round {Math.min(store.round, store.totalRounds)} / {store.totalRounds}
        </span>
        <span
          className="font-mono text-xl font-bold"
          style={{ color: ACCENT, textShadow: `0 0 10px ${ACCENT_GLOW}` }}
        >
          {score} pts
        </span>
        <span className="text-sm text-text-secondary">
          Rolls: {store.rollsLeft}
        </span>
      </div>

      {/* Rolls left indicator pips */}
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-2 w-8 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < store.rollsLeft
                  ? ACCENT
                  : "rgba(255, 255, 255, 0.1)",
              boxShadow:
                i < store.rollsLeft
                  ? `0 0 8px ${ACCENT_GLOW}`
                  : "none",
            }}
          />
        ))}
      </div>

      {/* Dice */}
      <div className="flex items-start justify-center gap-3">
        {store.dice.map((value, index) => (
          <DieFace
            key={index}
            value={value}
            isLocked={store.locked.has(index)}
            isRolling={store.isRolling && !store.locked.has(index)}
            onClick={() => handleToggleLock(index)}
            disabled={
              store.phase !== "rolling" ||
              value === 0 ||
              store.isRolling
            }
          />
        ))}
      </div>

      {/* Tap hint */}
      {store.phase === "rolling" && store.dice.every((d) => d > 0) && (
        <p className="text-xs text-text-secondary">
          Tap dice to hold them before rolling
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {store.phase === "rolling" && (
          <>
            <button
              onClick={handleRoll}
              disabled={!canRoll}
              className="rounded-xl border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
              style={{
                borderColor: canRoll ? ACCENT : "rgba(255, 255, 255, 0.1)",
                backgroundColor: canRoll ? ACCENT_BG : "transparent",
                color: canRoll ? ACCENT : "rgba(255, 255, 255, 0.3)",
                boxShadow: canRoll ? `0 0 15px ${ACCENT_GLOW}` : "none",
              }}
            >
              Roll ({store.rollsLeft})
            </button>
            <button
              onClick={handleScore}
              disabled={!canScore}
              className="rounded-xl border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
              style={{
                borderColor: canScore
                  ? "rgba(34, 197, 94, 0.6)"
                  : "rgba(255, 255, 255, 0.1)",
                backgroundColor: canScore
                  ? "rgba(34, 197, 94, 0.12)"
                  : "transparent",
                color: canScore ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
                boxShadow: canScore
                  ? "0 0 15px rgba(34, 197, 94, 0.3)"
                  : "none",
              }}
            >
              Score
            </button>
          </>
        )}

        {store.phase === "roundEnd" && (
          <button
            onClick={handleNextRound}
            className="rounded-xl border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: ACCENT,
              backgroundColor: ACCENT_BG,
              color: ACCENT,
              boxShadow: `0 0 15px ${ACCENT_GLOW}`,
            }}
          >
            {isLastRound ? "See Final Score" : "Next Round"}
          </button>
        )}
      </div>

      {/* Round Score Result */}
      {store.phase === "roundEnd" && store.lastScoreReason && (
        <div
          className="rounded-xl border-2 px-6 py-4 text-center"
          style={{
            borderColor: ACCENT,
            backgroundColor: ACCENT_BG,
            boxShadow: `0 0 25px ${ACCENT_GLOW}`,
            animation: showRoundResult ? "scorePopIn 0.4s ease-out" : "none",
          }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: ACCENT, textShadow: `0 0 12px ${ACCENT_GLOW}` }}
          >
            {store.lastScoreReason}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Total: {store.totalScore} pts
          </p>
        </div>
      )}

      {/* Scoring Guide */}
      <div
        className="w-full max-w-sm rounded-xl border p-4"
        style={{
          borderColor: "rgba(202, 138, 4, 0.2)",
          backgroundColor: "rgba(202, 138, 4, 0.04)",
        }}
      >
        <h3
          className="mb-3 text-center text-xs font-bold uppercase tracking-widest"
          style={{ color: ACCENT }}
        >
          Scoring Guide
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {[
            ["Five of a Kind", "100"],
            ["Four of a Kind", "70 + face x4"],
            ["Large Straight", "60"],
            ["Small Straight", "50"],
            ["Full House", "40 + sum"],
            ["Three of a Kind", "30 + face x3"],
            ["Two Pairs", "20 + faces x2"],
            ["Pair", "10 + face x2"],
            ["Nothing", "sum of dice"],
          ].map(([name, pts]) => (
            <div
              key={name}
              className="flex items-center justify-between border-b py-0.5"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <span className="text-text-secondary">{name}</span>
              <span
                className="font-mono font-bold"
                style={{ color: "rgba(202, 138, 4, 0.7)" }}
              >
                {pts}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes diceShake {
          0% {
            transform: rotate(0deg) scale(1);
          }
          15% {
            transform: rotate(-12deg) scale(1.1);
          }
          30% {
            transform: rotate(10deg) scale(1.05);
          }
          45% {
            transform: rotate(-8deg) scale(1.08);
          }
          60% {
            transform: rotate(6deg) scale(1.03);
          }
          75% {
            transform: rotate(-3deg) scale(1.01);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }
        @keyframes scorePopIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
