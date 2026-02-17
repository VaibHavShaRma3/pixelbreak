"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useMarbleMazeStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  checkGoal,
  checkFall,
  resetMarble,
  type MarbleMazeEngine,
} from "./engine";
import { LEVELS } from "./levels";
import type { GameState, GameCallbacks } from "@/types/game";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MarbleMazeProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarbleMaze({
  gameState,
  setScore,
  callbacks,
}: MarbleMazeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MarbleMazeEngine | null>(null);
  const finishedRef = useRef(false);
  const levelTimerRef = useRef(0);
  const transitionRef = useRef(false);

  // ------------------------------------------------------------------
  // Initialize / tear down engine when gameState changes to "playing"
  // ------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;
    if (engineRef.current) return;

    useMarbleMazeStore.getState().reset();
    finishedRef.current = false;
    levelTimerRef.current = 0;
    transitionRef.current = false;

    const level = LEVELS[0];
    const engine = initEngine(containerRef.current, level);
    engineRef.current = engine;

    containerRef.current.focus();

    return () => {
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameState]);

  // ------------------------------------------------------------------
  // Transition to next level (rebuilds engine with new level data)
  // ------------------------------------------------------------------
  const loadLevel = useCallback(
    (levelIndex: number) => {
      const container = containerRef.current;
      if (!container) return;

      // Tear down current engine
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }

      if (levelIndex >= LEVELS.length) {
        // All levels complete — end game
        finishedRef.current = true;
        const totalTime = useMarbleMazeStore.getState().totalTime;
        setScore(Math.round(totalTime * 1000));
        callbacks.onGameEnd(Math.round(totalTime * 1000));
        return;
      }

      const engine = initEngine(container, LEVELS[levelIndex]);
      engineRef.current = engine;
      levelTimerRef.current = 0;
      transitionRef.current = false;

      container.focus();
    },
    [callbacks, setScore]
  );

  // ------------------------------------------------------------------
  // Game loop
  // ------------------------------------------------------------------
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current || transitionRef.current) return;

      // Update physics + render
      updateEngine(engine, dt);

      // Track elapsed time for current level
      const clampedDt = Math.min(dt, 0.05);
      levelTimerRef.current += clampedDt;
      useMarbleMazeStore.getState().setElapsed(levelTimerRef.current);

      // Check if marble reached the goal
      if (checkGoal(engine)) {
        transitionRef.current = true;
        const store = useMarbleMazeStore.getState();
        store.completeLevel(levelTimerRef.current);

        const nextLevel = store.level + 1;

        // Brief delay before loading next level for visual feedback
        setTimeout(() => {
          useMarbleMazeStore.getState().nextLevel();
          loadLevel(nextLevel);
        }, 600);

        return;
      }

      // Check if marble fell off
      if (checkFall(engine)) {
        useMarbleMazeStore.getState().addFall();
        resetMarble(engine);
      }
    },
    gameState === "playing"
  );

  // ------------------------------------------------------------------
  // Keyboard controls
  // ------------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          engine.input.up = true;
          e.preventDefault();
          break;
        case "ArrowDown":
        case "KeyS":
          engine.input.down = true;
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "KeyA":
          engine.input.left = true;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          engine.input.right = true;
          e.preventDefault();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          engine.input.up = false;
          break;
        case "ArrowDown":
        case "KeyS":
          engine.input.down = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          engine.input.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          engine.input.right = false;
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

  // ------------------------------------------------------------------
  // Handle window resize
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const { level, elapsedTime, totalTime, falls, isComplete } =
    useMarbleMazeStore();

  const displayLevel = Math.min(level + 1, LEVELS.length);
  const timeStr = elapsedTime.toFixed(1);
  const totalStr = totalTime.toFixed(1);

  return (
    <div className="relative w-full" style={{ height: 500 }}>
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        tabIndex={0}
        style={{ touchAction: "none", outline: "none" }}
      />

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Level
            </span>
            <span className="ml-2 text-lg font-bold text-white">
              {displayLevel}
              <span className="text-sm font-normal text-gray-400">
                /{LEVELS.length}
              </span>
            </span>
          </div>

          <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Time
            </span>
            <span className="ml-2 text-lg font-bold tabular-nums text-white">
              {timeStr}s
            </span>
          </div>

          <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Falls
            </span>
            <span className="ml-2 text-lg font-bold text-rose-400">
              {falls}
            </span>
          </div>
        </div>

        {/* Total time (bottom left) */}
        <div className="absolute bottom-3 left-4">
          <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Total
            </span>
            <span className="ml-2 text-sm font-bold tabular-nums text-white">
              {totalStr}s
            </span>
          </div>
        </div>

        {/* Par time hint (bottom right) */}
        {level < LEVELS.length && (
          <div className="absolute bottom-3 right-4">
            <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Par
              </span>
              <span className="ml-2 text-sm font-bold text-yellow-400">
                {LEVELS[level].par}s
              </span>
            </div>
          </div>
        )}

        {/* Level complete flash */}
        {isComplete && !finishedRef.current && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse rounded-xl bg-black/70 px-8 py-4 backdrop-blur-md">
              <p className="text-2xl font-bold text-yellow-400">
                Level Complete!
              </p>
            </div>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="rounded-lg bg-black/40 px-3 py-1 backdrop-blur-sm">
            <span className="text-xs text-gray-500">
              Arrow Keys / WASD to tilt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
