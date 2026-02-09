"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useVelocityStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  startCountdown,
  type VelocityEngine,
} from "./engine";
import { VelocityHUD } from "./hud";
import type { GameState, GameCallbacks } from "@/types/game";

interface VelocityProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function Velocity({
  gameState,
  setScore,
  callbacks,
}: VelocityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VelocityEngine | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const store = useVelocityStore;

  // Initialize engine when playing starts
  useEffect(() => {
    if (gameState === "playing" && containerRef.current && !engineRef.current) {
      store.getState().reset();

      const engine = initEngine(containerRef.current);
      engineRef.current = engine;

      // Start countdown
      countdownIntervalRef.current = startCountdown(engine, () => {
        // Countdown ended — race starts
      });
    }

    return () => {
      if (gameState !== "playing" && gameState !== "paused") {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        if (engineRef.current) {
          disposeEngine(engineRef.current);
          engineRef.current = null;
        }
      }
    };
  }, [gameState, store]);

  // Game loop
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine) return;

      updateEngine(engine, dt);

      // Check if race finished
      const raceState = store.getState().raceState;
      if (raceState === "finished") {
        const totalTime = store.getState().totalRaceTime;
        setScore(Math.round(totalTime));
        callbacks.onGameEnd(Math.round(totalTime));
      }
    },
    gameState === "playing"
  );

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || store.getState().raceState !== "racing") return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          engine.input.forward = true;
          e.preventDefault();
          break;
        case "KeyS":
        case "ArrowDown":
          engine.input.backward = true;
          e.preventDefault();
          break;
        case "KeyA":
        case "ArrowLeft":
          engine.input.left = true;
          e.preventDefault();
          break;
        case "KeyD":
        case "ArrowRight":
          engine.input.right = true;
          e.preventDefault();
          break;
        case "Space":
          engine.input.drift = true;
          e.preventDefault();
          break;
      }
    },
    [store]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        engine.input.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        engine.input.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        engine.input.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        engine.input.right = false;
        break;
      case "Space":
        engine.input.drift = false;
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const engine = engineRef.current;
      const container = containerRef.current;
      if (!engine || !container) return;
      resizeEngine(engine, container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-full w-full" style={{ minHeight: 500 }}>
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ touchAction: "none" }}
      />
      <VelocityHUD />
    </div>
  );
}
