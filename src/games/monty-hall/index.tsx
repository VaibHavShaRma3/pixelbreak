"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useMontyHallStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface MontyHallProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const ACCENT = "#DB2777";
const ACCENT_GLOW = "rgba(219, 39, 119, 0.4)";
const ACCENT_BG = "rgba(219, 39, 119, 0.12)";
const ACCENT_BG_HOVER = "rgba(219, 39, 119, 0.25)";

const DOOR_LABELS = ["Door 1", "Door 2", "Door 3"];

export default function MontyHall({
  gameState,
  score,
  setScore,
  callbacks,
}: MontyHallProps) {
  const store = useMontyHallStore();
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const endedRef = useRef(false);
  const [hoveredDoor, setHoveredDoor] = useState<number | null>(null);
  const [resultFlash, setResultFlash] = useState<"won" | "lost" | null>(null);

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
      endedRef.current = false;
      setResultFlash(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Sync score with setScore each time wins change
  useEffect(() => {
    if (gameState === "playing") {
      setScore(store.wins * 50);
    }
  }, [store.wins, gameState, setScore]);

  // Flash effect on result
  useEffect(() => {
    if (store.phase === "result") {
      const won = store.finalChoice === store.prizeDoor;
      setResultFlash(won ? "won" : "lost");
      const timeout = setTimeout(() => setResultFlash(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [store.phase, store.finalChoice, store.prizeDoor]);

  // Handle game end after final round result
  const handleEndGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    const { wins, switchCount, history } = store;
    let finalScore = wins * 50;

    // Bonus: if player switched more than 60% of the time, +200 bonus
    const switchRate = history.length > 0 ? switchCount / history.length : 0;
    if (switchRate > 0.6) {
      finalScore += 200;
    }

    setScore(finalScore);

    // Short delay so player can see the final result before gameover
    setTimeout(() => callbacks.onGameEnd(finalScore), 600);
  }, [store, setScore, callbacks]);

  const handlePickDoor = useCallback(
    (door: number) => {
      if (gameState !== "playing" || store.phase !== "pick") return;
      store.pickDoor(door);
    },
    [gameState, store]
  );

  const handleStickOrSwitch = useCallback(
    (action: "stick" | "switch") => {
      if (gameState !== "playing" || store.phase !== "revealed") return;
      store.makeChoice(action);
    },
    [gameState, store]
  );

  const handleNextRound = useCallback(() => {
    if (gameState !== "playing") return;
    if (store.round >= store.totalRounds) {
      handleEndGame();
    } else {
      store.nextRound();
      setResultFlash(null);
    }
  }, [gameState, store, handleEndGame]);

  // Compute stats for display
  const switchWinRate =
    store.switchCount > 0
      ? Math.round((store.switchWins / store.switchCount) * 100)
      : 0;
  const stickWinRate =
    store.stickCount > 0
      ? Math.round((store.stickWins / store.stickCount) * 100)
      : 0;
  const switchRate =
    store.history.length > 0
      ? Math.round((store.switchCount / store.history.length) * 100)
      : 0;

  const isLastRound = store.round >= store.totalRounds && store.phase === "result";

  // Determine what each door shows based on phase
  function getDoorContent(doorIndex: number) {
    // Result phase: reveal all doors
    if (store.phase === "result") {
      if (doorIndex === store.prizeDoor) {
        return { emoji: "\uD83D\uDE97", label: "Car!" };
      }
      return { emoji: "\uD83D\uDC10", label: "Goat" };
    }

    // Revealed phase: show the revealed door's goat, keep others closed
    if (store.phase === "revealed") {
      if (doorIndex === store.revealedDoor) {
        return { emoji: "\uD83D\uDC10", label: "Goat" };
      }
      // Show door number for closed doors
      return null;
    }

    // Pick phase: all doors closed
    return null;
  }

  function getDoorStyle(doorIndex: number) {
    const isRevealed =
      store.phase === "revealed" && doorIndex === store.revealedDoor;
    const isPickable = store.phase === "pick";
    const isResult = store.phase === "result";
    const isPlayerFinal =
      isResult && doorIndex === store.finalChoice;
    const isPrize = isResult && doorIndex === store.prizeDoor;
    const isPlayerPick =
      store.phase === "revealed" && doorIndex === store.playerPick;
    const isHovered = hoveredDoor === doorIndex;

    let borderColor = "rgba(255, 255, 255, 0.12)";
    let bgColor = "rgba(255, 255, 255, 0.03)";
    let shadow = "none";
    let opacity = 1;
    let cursor = "default";
    let scale = "scale(1)";

    if (isRevealed) {
      // Revealed goat door
      borderColor = "rgba(255, 255, 255, 0.08)";
      bgColor = "rgba(0, 0, 0, 0.3)";
      opacity = 0.6;
    } else if (isResult) {
      if (isPrize && isPlayerFinal) {
        // Player won this door!
        borderColor = "#22c55e";
        bgColor = "rgba(34, 197, 94, 0.15)";
        shadow = "0 0 30px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)";
        scale = "scale(1.05)";
      } else if (isPrize) {
        // Prize door but player didn't pick it
        borderColor = ACCENT;
        bgColor = ACCENT_BG;
        shadow = `0 0 20px ${ACCENT_GLOW}`;
      } else if (isPlayerFinal) {
        // Player's losing door
        borderColor = "#ef4444";
        bgColor = "rgba(239, 68, 68, 0.12)";
        shadow = "0 0 15px rgba(239, 68, 68, 0.3)";
      } else {
        opacity = 0.5;
      }
    } else if (isPickable) {
      cursor = "pointer";
      borderColor = isHovered ? ACCENT : "rgba(219, 39, 119, 0.3)";
      bgColor = isHovered ? ACCENT_BG_HOVER : ACCENT_BG;
      shadow = isHovered
        ? `0 0 25px ${ACCENT_GLOW}, inset 0 0 15px rgba(219, 39, 119, 0.08)`
        : "none";
      scale = isHovered ? "scale(1.05)" : "scale(1)";
    } else if (isPlayerPick) {
      // Highlighted as the player's initial pick during revealed phase
      borderColor = ACCENT;
      bgColor = ACCENT_BG;
      shadow = `0 0 15px ${ACCENT_GLOW}`;
    }

    return {
      borderColor,
      backgroundColor: bgColor,
      boxShadow: shadow,
      opacity,
      cursor,
      transform: scale,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  }

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto p-4">
      {/* Round indicator */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">
          Round {Math.min(store.round, store.totalRounds)} /{" "}
          {store.totalRounds}
        </span>
        <span
          className="font-mono text-xl font-bold"
          style={{ color: ACCENT, textShadow: `0 0 10px ${ACCENT_GLOW}` }}
        >
          {score} pts
        </span>
      </div>

      {/* Phase prompt */}
      <div className="text-center">
        {store.phase === "pick" && (
          <h2
            className="text-2xl font-bold"
            style={{ color: ACCENT, textShadow: `0 0 15px ${ACCENT_GLOW}` }}
          >
            Choose a door!
          </h2>
        )}
        {store.phase === "revealed" && (
          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: ACCENT,
                textShadow: `0 0 15px ${ACCENT_GLOW}`,
              }}
            >
              Stick or Switch?
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {DOOR_LABELS[store.revealedDoor!]} has a goat. Do you stick with{" "}
              {DOOR_LABELS[store.playerPick!]} or switch?
            </p>
          </div>
        )}
        {store.phase === "result" && (
          <h2
            className="text-2xl font-bold"
            style={{
              color:
                store.finalChoice === store.prizeDoor ? "#22c55e" : "#ef4444",
              textShadow:
                store.finalChoice === store.prizeDoor
                  ? "0 0 15px rgba(34, 197, 94, 0.5)"
                  : "0 0 15px rgba(239, 68, 68, 0.5)",
            }}
          >
            {store.finalChoice === store.prizeDoor
              ? "You won the car!"
              : "You got a goat!"}
          </h2>
        )}
      </div>

      {/* Doors */}
      <div className="flex justify-center gap-4 sm:gap-6">
        {[0, 1, 2].map((doorIndex) => {
          const content = getDoorContent(doorIndex);
          const style = getDoorStyle(doorIndex);
          const isClickable = store.phase === "pick";

          return (
            <button
              key={doorIndex}
              onClick={() => handlePickDoor(doorIndex)}
              onMouseEnter={() => isClickable && setHoveredDoor(doorIndex)}
              onMouseLeave={() => setHoveredDoor(null)}
              disabled={!isClickable}
              className="flex h-44 w-32 flex-col items-center justify-center rounded-2xl border-2 sm:h-52 sm:w-36"
              style={style}
              aria-label={`${DOOR_LABELS[doorIndex]}${
                content ? ` - ${content.label}` : ""
              }`}
            >
              {content ? (
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="text-5xl"
                    style={{
                      filter:
                        store.phase === "result"
                          ? "drop-shadow(0 0 10px rgba(255,255,255,0.2))"
                          : "none",
                    }}
                  >
                    {content.emoji}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        content.label === "Car!"
                          ? "#22c55e"
                          : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {content.label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="text-4xl font-bold"
                    style={{
                      color:
                        store.phase === "revealed" &&
                        doorIndex === store.playerPick
                          ? ACCENT
                          : "rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    {doorIndex + 1}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color:
                        store.phase === "revealed" &&
                        doorIndex === store.playerPick
                          ? ACCENT
                          : "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {store.phase === "revealed" &&
                    doorIndex === store.playerPick
                      ? "Your pick"
                      : DOOR_LABELS[doorIndex]}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Stick / Switch buttons */}
      {store.phase === "revealed" && (
        <div className="flex gap-4">
          <button
            onClick={() => handleStickOrSwitch("stick")}
            className="rounded-xl border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: "#f59e0b",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
            }}
          >
            Stick
          </button>
          <button
            onClick={() => handleStickOrSwitch("switch")}
            className="rounded-xl border-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: ACCENT,
              backgroundColor: ACCENT_BG,
              color: ACCENT,
              boxShadow: `0 0 15px ${ACCENT_GLOW}`,
            }}
          >
            Switch
          </button>
        </div>
      )}

      {/* Next Round / Final button */}
      {store.phase === "result" && (
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

      {/* Result flash overlay */}
      {resultFlash && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              resultFlash === "won"
                ? "radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)"
                : "radial-gradient(circle at center, rgba(239, 68, 68, 0.12) 0%, transparent 70%)",
            animation: "flashFade 1.5s ease-out forwards",
          }}
        />
      )}

      {/* Stats panel */}
      <div
        className="mt-2 w-full max-w-md rounded-xl border p-4"
        style={{
          borderColor: "rgba(219, 39, 119, 0.2)",
          backgroundColor: "rgba(219, 39, 119, 0.04)",
        }}
      >
        <h3
          className="mb-3 text-center text-xs font-bold uppercase tracking-widest"
          style={{ color: ACCENT }}
        >
          Statistics
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-text-secondary">Wins</p>
            <p className="text-lg font-bold text-text-primary">
              {store.wins} / {store.history.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Switch Win%</p>
            <p
              className="text-lg font-bold"
              style={{ color: store.switchCount > 0 ? "#22c55e" : "rgba(255,255,255,0.3)" }}
            >
              {store.switchCount > 0 ? `${switchWinRate}%` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Stick Win%</p>
            <p
              className="text-lg font-bold"
              style={{ color: store.stickCount > 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}
            >
              {store.stickCount > 0 ? `${stickWinRate}%` : "--"}
            </p>
          </div>
        </div>

        {/* History dots */}
        {store.history.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {store.history.map((entry, i) => (
              <div
                key={i}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                title={`Round ${i + 1}: ${entry.switched ? "Switched" : "Stuck"} - ${entry.won ? "Won" : "Lost"}`}
                style={{
                  backgroundColor: entry.won
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(239, 68, 68, 0.2)",
                  border: `1px solid ${
                    entry.won
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(239, 68, 68, 0.5)"
                  }`,
                  color: entry.won ? "#22c55e" : "#ef4444",
                }}
              >
                {entry.switched ? "S" : "K"}
              </div>
            ))}
          </div>
        )}

        {/* Switch rate indicator for bonus */}
        {store.history.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-[10px] text-text-secondary">
              Switch rate: {switchRate}%{" "}
              {switchRate > 60 ? (
                <span style={{ color: "#22c55e" }}>(+200 bonus!)</span>
              ) : (
                <span className="text-text-secondary">
                  (switch {">"}60% for +200 bonus)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes flashFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
