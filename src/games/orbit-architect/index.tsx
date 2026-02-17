"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "@/games/_shared/use-game-loop";
import { useOrbitStore } from "./store";
import {
  initEngine,
  updateEngine,
  resizeEngine,
  disposeEngine,
  addPlanet,
  startSimulation,
  getScore,
  showGhostPlanet,
  updateVelocityArrow,
  cleanupPlacementVisuals,
  screenToWorldPos,
  VELOCITY_SCALE,
  type OrbitEngine,
} from "./engine";
import { OrbitHUD } from "./hud";
import type { GameState, GameCallbacks } from "@/types/game";
import * as THREE from "three";

interface OrbitArchitectProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function OrbitArchitect({
  gameState,
  setScore,
  callbacks,
}: OrbitArchitectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbitEngine | null>(null);
  const finishedRef = useRef(false);

  // Track drag state via refs so mouse handlers always see latest values
  const dragOriginWorld = useRef<THREE.Vector3 | null>(null);

  // ---- Initialize engine ----
  useEffect(() => {
    if (gameState !== "playing" || !containerRef.current) return;
    if (engineRef.current) return;

    useOrbitStore.getState().reset();
    finishedRef.current = false;

    const engine = initEngine(containerRef.current);
    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        disposeEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, [gameState]);

  // ---- Game loop ----
  useGameLoop(
    (dt) => {
      const engine = engineRef.current;
      if (!engine || finishedRef.current) return;

      updateEngine(engine, dt);

      // Check if simulation ended
      const store = useOrbitStore.getState();
      if (store.phase === "done" && !finishedRef.current) {
        finishedRef.current = true;
        const finalScore = store.score;
        setScore(finalScore);
        callbacks.onGameEnd(finalScore);
      }
    },
    gameState === "playing"
  );

  // ---- Mouse handlers for placement ----
  useEffect(() => {
    const canvas = engineRef.current?.renderer.domElement;
    // We attach to the container so events fire even before engine init
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.placementMode) return;

      const store = useOrbitStore.getState();
      if (engine.planets.length >= store.maxPlanets) return;

      const worldPos = screenToWorldPos(engine, e.clientX, e.clientY);
      if (!worldPos) return;

      // Prevent placing on top of the star
      if (worldPos.length() < engine.star.radius + 1) return;

      dragOriginWorld.current = worldPos.clone();
      engine.dragStart = new THREE.Vector2(e.clientX, e.clientY);
      engine.dragCurrent = new THREE.Vector2(e.clientX, e.clientY);

      // Show ghost planet at click position
      showGhostPlanet(engine, worldPos);
    };

    const onMouseMove = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.placementMode) return;
      if (!dragOriginWorld.current || !engine.dragStart) return;

      engine.dragCurrent = new THREE.Vector2(e.clientX, e.clientY);

      // Compute world‑space velocity from drag
      const currentWorld = screenToWorldPos(engine, e.clientX, e.clientY);
      if (!currentWorld) return;

      const dir = new THREE.Vector3().subVectors(currentWorld, dragOriginWorld.current);
      const len = dir.length();

      updateVelocityArrow(engine, dragOriginWorld.current, dir, len);
    };

    const onMouseUp = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.placementMode) return;
      if (!dragOriginWorld.current) return;

      const currentWorld = screenToWorldPos(engine, e.clientX, e.clientY);
      const origin = dragOriginWorld.current.clone();
      dragOriginWorld.current = null;

      // Cleanup visuals
      cleanupPlacementVisuals(engine);
      engine.dragStart = null;
      engine.dragCurrent = null;

      if (!currentWorld) return;

      // Velocity = drag direction * scale
      const dragVec = new THREE.Vector3().subVectors(currentWorld, origin);
      const velocity = dragVec.multiplyScalar(VELOCITY_SCALE);

      // Ensure z=0 for 2D orbital plane
      origin.z = 0;
      velocity.z = 0;

      addPlanet(engine, origin, velocity);
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
    };
  }, [gameState]);

  // ---- Handle resize ----
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

  // ---- Launch handler ----
  const handleLaunch = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    startSimulation(engine);
  }, []);

  return (
    <div className="relative w-full" style={{ height: 500 }}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        tabIndex={0}
        style={{ touchAction: "none", outline: "none", cursor: "crosshair" }}
      />
      <OrbitHUD onLaunch={handleLaunch} />
    </div>
  );
}
