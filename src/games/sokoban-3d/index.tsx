"use client";

import { useEffect, useRef } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useSokobanStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  tryMove,
  isLevelComplete,
  type SokobanEngine,
} from "./engine";
import { LEVELS } from "./levels";
import type { GameState, GameCallbacks } from "@/types/game";

interface SokobanProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function Sokoban3D({
  gameState,
  setScore,
  callbacks,
}: SokobanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SokobanEngine | null>(null);
  const finishedRef = useRef(false);

  const { level, moves, totalScore, isComplete } = useSokobanStore();

  // Initialize / re-initialize engine when level changes or game starts
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;

    const store = useSokobanStore.getState();
    const currentLevel = store.level;

    // All levels done
    if (currentLevel >= LEVELS.length) return;

    // Dispose previous engine if any
    if (engineRef.current) {
      disposeEngine(engineRef.current);
      engineRef.current = null;
    }

    const engine = initEngine(containerRef.current, LEVELS[currentLevel]);
    engineRef.current = engine;

    // Focus for keyboard input
    containerRef.current.focus();

    return () => {
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameState, level]);

  // Reset store when game starts
  useEffect(() => {
    if (gameState === "playing") {
      useSokobanStore.getState().reset();
      finishedRef.current = false;
    }
  }, [gameState]);

  // Game loop
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;
      updateEngine(engine, dt);
    },
    gameState === "playing"
  );

  // Handle level completion transition
  useEffect(() => {
    if (!isComplete || finishedRef.current) return;

    const store = useSokobanStore.getState();
    const nextLevelIndex = store.level + 1;

    if (nextLevelIndex >= LEVELS.length) {
      // All levels done -- end game
      finishedRef.current = true;
      const finalScore = store.totalScore;
      setScore(finalScore);
      callbacks.onGameEnd(finalScore);
    } else {
      // Move to next level after a brief delay so player sees "complete"
      const timer = setTimeout(() => {
        useSokobanStore.getState().nextLevel();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, setScore, callbacks]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || engine.isAnimating || finishedRef.current) return;

      const store = useSokobanStore.getState();
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

      const moved = tryMove(engine, dx, dz);
      if (moved) {
        useSokobanStore.getState().addMove();

        // Check completion after a small delay for animation to settle
        setTimeout(() => {
          if (isLevelComplete(engine)) {
            const s = useSokobanStore.getState();
            useSokobanStore.getState().completeLevel(
              s.moves,
              LEVELS[s.level].par
            );
          }
        }, 200);
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

  const currentPar = level < LEVELS.length ? LEVELS[level].par : 0;

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
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="flex justify-between items-start p-4">
          {/* Level & moves info */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <div className="text-sm font-medium opacity-70">
              Level {level + 1} / {LEVELS.length}
            </div>
            <div className="text-lg font-bold">
              Moves: {moves}
            </div>
            <div className="text-sm opacity-70">
              Par: {currentPar}
            </div>
          </div>

          {/* Score */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-right">
            <div className="text-sm font-medium opacity-70">Score</div>
            <div className="text-lg font-bold text-green-400">
              {totalScore}
            </div>
          </div>
        </div>
      </div>

      {/* Level complete overlay */}
      {isComplete && !finishedRef.current && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl px-8 py-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              Level Complete!
            </div>
            <div className="text-white opacity-80">
              {moves} moves (par: {currentPar})
            </div>
            <div className="text-green-300 text-sm mt-1">
              +{Math.max(500 - (moves - currentPar) * 20, 100)} points
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="flex justify-center p-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs opacity-60">
            Arrow keys or WASD to move. Push crates onto green goals.
          </div>
        </div>
      </div>
    </div>
  );
}
