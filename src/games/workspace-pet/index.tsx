"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useWorkspacePetStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface WorkspacePetProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const MOOD_EMOJI: Record<string, string> = {
  happy: "\ud83d\ude0a",
  neutral: "\ud83d\ude10",
  sad: "\ud83d\ude22",
  sleeping: "\ud83d\ude34",
  eating: "\ud83c\udf7d\ufe0f",
  playing: "\ud83c\udfae",
};

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-muted w-20 text-right">{label}</span>
      <div className="flex-1 h-4 bg-surface-2 rounded-full overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      <span className="text-xs text-muted w-8">{Math.round(value)}</span>
    </div>
  );
}

export default function WorkspacePet({
  gameState,
  score,
  setScore,
  callbacks,
}: WorkspacePetProps) {
  const store = useWorkspacePetStore();
  const [bounceAnim, setBounceAnim] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
    }
  }, [gameState, store.reset, setScore]);

  // Game loop for stat decay
  useEffect(() => {
    if (gameState !== "playing") return;

    lastTimeRef.current = 0;

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      store.decayStats(delta);
      store.updateMood();

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gameState, store.decayStats, store.updateMood]);

  // Check game over: any stat hits 0
  useEffect(() => {
    if (gameState !== "playing") return;
    if (store.hunger <= 0 || store.happiness <= 0 || store.energy <= 0) {
      callbacks.onGameEnd(scoreRef.current);
    }
  }, [
    gameState,
    store.hunger,
    store.happiness,
    store.energy,
    callbacks,
  ]);

  const triggerAction = useCallback(
    (action: () => void, label: string) => {
      if (gameState !== "playing") return;
      action();
      setScore((prev: number) => prev + 1);
      setBounceAnim(true);
      setActionFeedback(label);
      setTimeout(() => setBounceAnim(false), 300);
      setTimeout(() => setActionFeedback(null), 1000);
    },
    [gameState, setScore]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Cozy room background overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,45,149,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Pet name */}
      <div className="relative z-10">
        <h2 className="text-lg font-[family-name:var(--font-pixel)] text-neon-pink glow-pink">
          {store.name}
        </h2>
      </div>

      {/* Pet display */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`text-8xl transition-transform duration-300 select-none ${
            bounceAnim ? "scale-125" : "scale-100"
          }`}
          style={{
            filter:
              store.mood === "sleeping"
                ? "brightness(0.6)"
                : "brightness(1)",
          }}
        >
          {MOOD_EMOJI[store.mood] || "\ud83d\ude0a"}
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div
            className="absolute -top-4 text-sm font-bold text-neon-yellow animate-bounce"
            style={{ textShadow: "0 0 8px #ffe60060" }}
          >
            {actionFeedback}
          </div>
        )}

        {/* Mood label */}
        <p className="mt-2 text-xs text-muted capitalize">{store.mood}</p>
      </div>

      {/* Stats */}
      <div className="relative z-10 flex flex-col gap-2 w-full max-w-xs">
        <StatBar label="Hunger" value={store.hunger} color="#f97316" />
        <StatBar label="Happiness" value={store.happiness} color="#ff2d95" />
        <StatBar label="Energy" value={store.energy} color="#39ff14" />
      </div>

      {/* Action buttons */}
      <div className="relative z-10 grid grid-cols-2 gap-3 w-full max-w-xs">
        <button
          onClick={() => triggerAction(store.feed, "Yum! +hunger")}
          disabled={gameState !== "playing" || store.energy < 5}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium transition-all hover:border-orange-400/50 hover:bg-orange-400/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{"\ud83c\udf55"}</span> Feed
        </button>
        <button
          onClick={() => triggerAction(store.play, "Fun! +happy")}
          disabled={gameState !== "playing" || store.energy < 10}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium transition-all hover:border-neon-pink/50 hover:bg-neon-pink/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{"\ud83c\udfbe"}</span> Play
        </button>
        <button
          onClick={() => triggerAction(store.sleep, "Zzz... +energy")}
          disabled={gameState !== "playing"}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium transition-all hover:border-neon-purple/50 hover:bg-neon-purple/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{"\ud83d\udca4"}</span> Sleep
        </button>
        <button
          onClick={() => triggerAction(store.pet, "Love! +happy")}
          disabled={gameState !== "playing"}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium transition-all hover:border-red-400/50 hover:bg-red-400/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{"\u2764\ufe0f"}</span> Pet
        </button>
      </div>

      {/* Interaction count */}
      <div className="relative z-10 text-xs text-muted">
        Total care actions: <span className="text-neon-cyan">{score}</span>
      </div>
    </div>
  );
}
