"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useCubeRollStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  startMove,
  getTopFace,
  resetToStart,
  getFaceColorName,
  type CubeRollEngine,
} from "./engine";
import { LEVELS } from "./levels";
import type { GameState, GameCallbacks } from "@/types/game";

interface CubeRollProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function CubeRoll({
  gameState,
  setScore,
  callbacks,
}: CubeRollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CubeRollEngine | null>(null);
  const finishedRef = useRef(false);

  const level = useCubeRollStore((s) => s.level);
  const moves = useCubeRollStore((s) => s.moves);
  const totalScore = useCubeRollStore((s) => s.totalScore);
  const isComplete = useCubeRollStore((s) => s.isComplete);
  const message = useCubeRollStore((s) => s.message);

  // Build / rebuild engine whenever level changes while playing
  const buildEngine = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dispose previous engine
    if (engineRef.current) {
      disposeEngine(engineRef.current);
      engineRef.current = null;
    }

    const currentLevel = useCubeRollStore.getState().level;
    if (currentLevel >= LEVELS.length) return;

    const engine = initEngine(container, LEVELS[currentLevel]);
    engineRef.current = engine;
  }, []);

  // Initialize engine when playing starts
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;

    if (engineRef.current) return;

    useCubeRollStore.getState().reset();
    finishedRef.current = false;
    buildEngine();

    containerRef.current.focus();

    return () => {
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Rebuild engine when level advances
  useEffect(() => {
    if (gameState !== "playing") return;
    if (level === 0 && engineRef.current) return; // already built on init
    if (level >= LEVELS.length) return;
    buildEngine();
    containerRef.current?.focus();
  }, [level, gameState, buildEngine]);

  // Game loop
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;

      const result = updateEngine(engine, dt);

      if (result) {
        const store = useCubeRollStore.getState();

        if (result.fell) {
          // Fell into hole — reset to start
          store.setMessage("Fell off! Resetting...");
          setTimeout(() => {
            if (engineRef.current && !engineRef.current.disposed) {
              resetToStart(engineRef.current);
              useCubeRollStore.getState().setMessage("");
            }
          }, 600);
        } else if (result.reachedGoal) {
          if (result.correctFace) {
            // Level complete
            store.completeLevel(store.moves, LEVELS[store.level].par);
          } else {
            const targetFace = LEVELS[store.level].targetFace;
            store.setMessage(
              `Wrong face! Need ${getFaceColorName(targetFace)} on top. Keep rolling!`
            );
          }
        }
      }
    },
    gameState === "playing"
  );

  // Handle level complete — advance or end game
  useEffect(() => {
    if (!isComplete) return;

    const timer = setTimeout(() => {
      const store = useCubeRollStore.getState();
      const nextLevel = store.level + 1;

      if (nextLevel >= LEVELS.length) {
        // All levels done
        finishedRef.current = true;
        setScore(store.totalScore);
        callbacks.onGameEnd(store.totalScore);
      } else {
        store.nextLevel();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isComplete, callbacks, setScore]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || engine.isAnimating || engine.disposed) return;

      const store = useCubeRollStore.getState();
      if (store.isComplete) return;

      let dx = 0;
      let dz = 0;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          dz = -1;
          e.preventDefault();
          break;
        case "ArrowDown":
        case "KeyS":
          dz = 1;
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "KeyA":
          dx = -1;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          dx = 1;
          e.preventDefault();
          break;
        default:
          return;
      }

      const moved = startMove(engine, dx, dz);
      if (moved) {
        store.addMove();
        // Clear any lingering message
        if (store.message && !store.message.includes("Fell")) {
          store.setMessage("");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  // Determine target face hint for current level
  const currentLevel = level < LEVELS.length ? LEVELS[level] : null;
  const targetFaceName = currentLevel
    ? getFaceColorName(currentLevel.targetFace)
    : "";

  return (
    <div className="relative w-full" style={{ height: 500 }}>
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        tabIndex={0}
        style={{ touchAction: "none", outline: "none" }}
      />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Level info */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
            <div className="font-bold">
              Level {level + 1} / {LEVELS.length}
            </div>
            <div className="text-gray-300 text-xs">
              Target: <span className="font-semibold text-green-400">{targetFaceName}</span> face on top
            </div>
          </div>

          {/* Moves and score */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm text-right">
            <div>
              Moves: <span className="font-bold">{moves}</span>
              {currentLevel && (
                <span className="text-gray-400 text-xs ml-1">
                  (par: {currentLevel.par})
                </span>
              )}
            </div>
            <div className="text-xs text-gray-300">
              Score: <span className="font-semibold text-purple-400">{totalScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message overlay */}
      {message && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-lg font-bold">
            {message}
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-gray-400 text-xs">
          Arrow keys or WASD to roll the cube
        </div>
      </div>
    </div>
  );
}
