"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFocusForestStore, getGrowthProgress } from "./store";
import {
  createSparkles,
  updateSparkles,
  render,
  type Sparkle,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface FocusForestProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

export default function FocusForest({
  gameState,
  score,
  setScore,
  callbacks,
}: FocusForestProps) {
  const {
    elapsedSeconds,
    previousTrees,
    setElapsedSeconds,
    addPreviousTree,
    reset,
  } = useFocusForestStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sparklesRef = useRef<Sparkle[]>(createSparkles(15, 200, 400));
  const gameStateRef = useRef(gameState);
  const elapsedRef = useRef(elapsedSeconds);
  const previousTreesRef = useRef(previousTrees);

  gameStateRef.current = gameState;
  elapsedRef.current = elapsedSeconds;
  previousTreesRef.current = previousTrees;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
      sparklesRef.current = createSparkles(15, 200, 400);
    }
  }, [gameState, reset, setScore]);

  // Timer — tick every second
  useEffect(() => {
    if (gameState !== "playing") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(elapsedRef.current + 1);
      setScore((prev: number) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, setElapsedSeconds, setScore]);

  // Update elapsed ref when state changes
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Animation loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = 0;

    function loop(timestamp: number) {
      if (gameStateRef.current !== "playing") return;

      const dt = lastTime ? (timestamp - lastTime) / 1000 : 1 / 60;
      lastTime = timestamp;

      const growth = getGrowthProgress(elapsedRef.current);
      updateSparkles(sparklesRef.current, dt);
      render(
        ctx!,
        growth,
        elapsedRef.current,
        sparklesRef.current,
        previousTreesRef.current,
        timestamp
      );

      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const handleHarvest = useCallback(() => {
    const elapsed = elapsedRef.current;
    if (elapsed > 0) {
      addPreviousTree(elapsed);
    }
    callbacks.onGameEnd(elapsed);
  }, [callbacks, addPreviousTree]);

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg border border-border"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="text-sm text-muted">
          Focus Time:{" "}
          <span className="font-bold text-[#39ff14]">
            {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
          </span>
        </div>

        {previousTrees.length > 0 && (
          <div className="text-sm text-muted">
            Forest:{" "}
            <span className="font-bold text-[#39ff14]">
              {previousTrees.length} tree{previousTrees.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {gameState === "playing" && (
          <button
            onClick={handleHarvest}
            className="rounded-lg border border-[#39ff14] bg-[#39ff14]/10 px-4 py-2 text-sm font-medium text-[#39ff14] transition-all hover:bg-[#39ff14]/20"
            style={{ textShadow: "0 0 10px #39ff14" }}
          >
            Harvest Tree
          </button>
        )}
      </div>
    </div>
  );
}
