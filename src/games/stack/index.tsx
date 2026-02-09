"use client";

import { useEffect, useCallback } from "react";
import { useCanvas } from "@/games/_shared/use-canvas";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useStackStore } from "./store";
import { renderState, CANVAS_WIDTH, CANVAS_HEIGHT } from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface StackProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function Stack({
  gameState,
  setScore,
  callbacks,
}: StackProps) {
  const { canvasRef, getContext } = useCanvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
  const { engine, update, drop, reset } = useStackStore();

  useEffect(() => {
    if (gameState === "playing") {
      reset();
    }
  }, [gameState, reset]);

  // Game loop
  useGameLoop(() => {
    update();

    const ctx = getContext();
    if (ctx) {
      renderState(ctx, engine);
    }

    if (engine.gameOver) {
      callbacks.onGameEnd(engine.score);
    }
  }, gameState === "playing" && !engine.gameOver);

  const handleDrop = useCallback(() => {
    if (gameState !== "playing") return;
    const newScore = drop();
    setScore(newScore);
  }, [gameState, drop, setScore]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleDrop();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDrop]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      <canvas
        ref={canvasRef}
        onClick={handleDrop}
        className="cursor-pointer rounded-lg border border-border"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      />
      <p className="text-xs text-muted">
        Click or press Space to drop the block
      </p>
    </div>
  );
}
