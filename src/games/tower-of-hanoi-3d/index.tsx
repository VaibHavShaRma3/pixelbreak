"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useHanoiStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  selectPeg,
  isComplete,
  type HanoiEngine,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface TowerOfHanoi3DProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TowerOfHanoi3D({
  gameState,
  score,
  setScore,
  callbacks,
}: TowerOfHanoi3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HanoiEngine | null>(null);
  const finishedRef = useRef(false);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Pull reactive state for HUD
  const level = useHanoiStore((s) => s.level);
  const moves = useHanoiStore((s) => s.moves);
  const minMoves = useHanoiStore((s) => s.minMoves);
  const totalScore = useHanoiStore((s) => s.totalScore);
  const isLevelComplete = useHanoiStore((s) => s.isComplete);
  const message = useHanoiStore((s) => s.message);
  const numDisks = useHanoiStore((s) => s.numDisks);

  /* ---------------------------------------------------------------- */
  /*  Initialize / re-initialize engine                                */
  /* ---------------------------------------------------------------- */

  const initOrReinitEngine = useCallback(() => {
    if (!containerRef.current) return;

    // Dispose previous engine if any
    if (engineRef.current) {
      disposeEngine(engineRef.current);
      engineRef.current = null;
    }

    const store = useHanoiStore.getState();
    const engine = initEngine(containerRef.current, store.numDisks);
    engineRef.current = engine;
  }, []);

  // Init engine when game starts playing
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;

    if (engineRef.current) return;

    useHanoiStore.getState().reset();
    finishedRef.current = false;
    initOrReinitEngine();

    return () => {
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameState, initOrReinitEngine]);

  // Re-init when numDisks changes (next level)
  useEffect(() => {
    if (gameState !== "playing") return;
    if (!engineRef.current) return;

    const store = useHanoiStore.getState();
    // Only reinit if the engine's disk count doesn't match
    if (engineRef.current.numDisks !== store.numDisks) {
      initOrReinitEngine();
    }
  }, [numDisks, gameState, initOrReinitEngine]);

  /* ---------------------------------------------------------------- */
  /*  Game loop                                                        */
  /* ---------------------------------------------------------------- */

  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;
      updateEngine(engine, dt);
    },
    gameState === "playing",
  );

  /* ---------------------------------------------------------------- */
  /*  Handle peg selection result                                      */
  /* ---------------------------------------------------------------- */

  const handlePegSelect = useCallback(
    (pegIndex: number) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;
      if (useHanoiStore.getState().isComplete) return;

      const result = selectPeg(engine, pegIndex);

      if (result.moved) {
        useHanoiStore.getState().addMove();

        // Check completion
        if (isComplete(engine)) {
          useHanoiStore.getState().completeLevel();
          const store = useHanoiStore.getState();

          if (store.level >= 3) {
            // All levels done
            finishedRef.current = true;
            setScore(store.totalScore);
            // Small delay so the final drop animation finishes
            setTimeout(() => {
              callbacks.onGameEnd(store.totalScore);
            }, 800);
          }
        }
      }
    },
    [callbacks, setScore],
  );

  /* ---------------------------------------------------------------- */
  /*  Keyboard controls: 1 / 2 / 3                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (e.key) {
        case "1":
          handlePegSelect(0);
          e.preventDefault();
          break;
        case "2":
          handlePegSelect(1);
          e.preventDefault();
          break;
        case "3":
          handlePegSelect(2);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, handlePegSelect]);

  /* ---------------------------------------------------------------- */
  /*  Mouse click — raycasting to detect peg clicks                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onClick = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || gameState !== "playing") return;

      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, engine.camera);

      // Check intersections with pegs, disks, and invisible click zones
      const allClickTargets: THREE.Object3D[] = [...engine.pegs];

      // Also include disks as click targets
      for (let p = 0; p < 3; p++) {
        for (const disk of engine.disks[p]) {
          allClickTargets.push(disk);
        }
      }

      // Add the held disk if any
      if (engine.animatingDisk) {
        allClickTargets.push(engine.animatingDisk);
      }

      const intersects =
        raycasterRef.current.intersectObjects(allClickTargets);

      if (intersects.length > 0) {
        const hit = intersects[0].object;

        // Determine which peg this belongs to
        if (hit.userData.pegIndex !== undefined) {
          handlePegSelect(hit.userData.pegIndex as number);
          return;
        }

        // Check if it's a disk — find which peg it's on
        for (let p = 0; p < 3; p++) {
          if (engine.disks[p].includes(hit as THREE.Mesh)) {
            handlePegSelect(p);
            return;
          }
        }

        // Check if it's the held disk — treat as clicking the from peg
        // to cancel, or use closest peg logic
        if (hit === engine.animatingDisk && engine.selectedPeg !== null) {
          handlePegSelect(engine.selectedPeg);
          return;
        }
      }

      // If click didn't hit anything specific, determine closest peg by x coordinate
      // of the click point projected onto the scene
      const clickPoint = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
      clickPoint.unproject(engine.camera);
      const dir = clickPoint.sub(engine.camera.position).normalize();
      // Find where ray intersects y=2 plane (roughly peg height)
      const t = (2 - engine.camera.position.y) / dir.y;
      if (t > 0) {
        const worldX = engine.camera.position.x + dir.x * t;
        // Determine closest peg
        let closestPeg = 0;
        let closestDist = Infinity;
        for (let p = 0; p < 3; p++) {
          const pegXPos = (p - 1) * 3.5;
          const dist = Math.abs(worldX - pegXPos);
          if (dist < closestDist) {
            closestDist = dist;
            closestPeg = p;
          }
        }
        if (closestDist < 2.5) {
          handlePegSelect(closestPeg);
        }
      }
    };

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [gameState, handlePegSelect]);

  /* ---------------------------------------------------------------- */
  /*  Handle resize                                                    */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  Next Level handler                                               */
  /* ---------------------------------------------------------------- */

  const handleNextLevel = useCallback(() => {
    useHanoiStore.getState().nextLevel();
    // The numDisks useEffect will handle re-initialization
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative w-full" style={{ height: 500 }}>
      {/* Three.js container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        tabIndex={0}
        style={{ touchAction: "none", outline: "none", cursor: "pointer" }}
      />

      {/* HUD Overlay */}
      {gameState === "playing" && (
        <div className="pointer-events-none absolute inset-0">
          {/* Top bar stats */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Level {level}/3
            </div>
            <div className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Moves: {moves}{" "}
              <span className="text-gray-400">(min: {minMoves})</span>
            </div>
            <div className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Score: {totalScore}
            </div>
          </div>

          {/* Peg labels */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-[7rem]">
            <span className="rounded bg-black/50 px-2 py-0.5 text-xs text-gray-300">
              1
            </span>
            <span className="rounded bg-black/50 px-2 py-0.5 text-xs text-gray-300">
              2
            </span>
            <span className="rounded bg-black/50 px-2 py-0.5 text-xs text-gray-300">
              3
            </span>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
            Press 1, 2, 3 or click a peg to select / place disks. Move all
            disks to peg 3.
          </div>

          {/* Level complete overlay */}
          {isLevelComplete && (
            <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl bg-gray-900/90 p-6 text-center shadow-2xl">
                <h2 className="mb-2 text-2xl font-bold text-green-400">
                  {level >= 3 ? "All Levels Complete!" : "Level Complete!"}
                </h2>
                <p className="mb-4 text-gray-300">{message}</p>
                <p className="mb-4 text-sm text-gray-400">
                  Moves used: {moves} | Minimum: {minMoves}
                </p>
                {level < 3 && (
                  <button
                    onClick={handleNextLevel}
                    className="rounded-lg bg-cyan-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-cyan-500"
                  >
                    Next Level
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
