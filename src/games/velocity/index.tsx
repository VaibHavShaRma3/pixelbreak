"use client";

import { useEffect, useRef } from "react";
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
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  // Initialize engine when playing starts
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;

    // Already initialized
    if (engineRef.current) return;

    useVelocityStore.getState().reset();
    finishedRef.current = false;

    const engine = initEngine(containerRef.current);
    engineRef.current = engine;

    // Start countdown
    countdownRef.current = startCountdown(engine, () => {
      // Race begins — focus the container for keyboard input
      containerRef.current?.focus();
    });

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameState]);

  // Game loop
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;

      updateEngine(engine, dt);

      // Check if race finished
      const raceState = useVelocityStore.getState().raceState;
      if (raceState === "finished" && !finishedRef.current) {
        finishedRef.current = true;
        const totalTime = useVelocityStore.getState().totalRaceTime;
        setScore(Math.round(totalTime));
        callbacks.onGameEnd(Math.round(totalTime));
      }
    },
    gameState === "playing"
  );

  // Keyboard controls — use direct event listeners, no useCallback
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Allow input during both countdown (car locked by physics) and racing
      const state = useVelocityStore.getState().raceState;
      if (state !== "racing" && state !== "countdown") return;

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
    };

    const onKeyUp = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

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
    <div className="relative w-full" style={{ height: 500 }}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        tabIndex={0}
        style={{ touchAction: "none", outline: "none" }}
      />
      <VelocityHUD />
    </div>
  );
}
