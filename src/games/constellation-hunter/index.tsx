"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useConstellationHunterStore } from "./store";
import {
  getConstellation,
  getConstellationCount,
  generateBackgroundStars,
  checkConnection,
  connectionToKey,
  renderStars,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface ConstellationHunterProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const STAR_HIT_RADIUS = 25;
const TOTAL_LEVELS = getConstellationCount();

export default function ConstellationHunter({
  gameState,
  score,
  setScore,
  callbacks,
}: ConstellationHunterProps) {
  const {
    currentLevel,
    connectedPairs,
    timeLeft,
    setCurrentLevel,
    addConnection,
    addScore,
    decrementTime,
    reset,
  } = useConstellationHunterStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseRef = useRef(0);
  const bgStarsRef = useRef(generateBackgroundStars(200));
  const draggingRef = useRef<{
    fromIndex: number;
    toX: number;
    toY: number;
  } | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const connectedPairsRef = useRef(connectedPairs);
  connectedPairsRef.current = connectedPairs;
  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const [flashWrong, setFlashWrong] = useState(false);
  const [levelMessage, setLevelMessage] = useState("");

  const constellation = getConstellation(currentLevel);

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
      bgStarsRef.current = generateBackgroundStars(200);
      setLevelMessage(`Level 1: ${getConstellation(0).name}`);
      setTimeout(() => setLevelMessage(""), 2000);
    }
  }, [gameState, reset, setScore]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentLevel, decrementTime]);

  // Time out check
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      // Move to next level or end
      if (currentLevel + 1 >= TOTAL_LEVELS) {
        callbacks.onGameEnd(scoreRef.current);
      } else {
        setLevelMessage("Time's up!");
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setLevelMessage(
            `Level ${currentLevel + 2}: ${getConstellation(currentLevel + 1).name}`
          );
          setTimeout(() => setLevelMessage(""), 2000);
        }, 1000);
      }
    }
  }, [timeLeft, gameState, currentLevel, setCurrentLevel, callbacks]);

  // Check level completion
  useEffect(() => {
    if (gameState !== "playing") return;
    const cons = getConstellation(currentLevel);
    if (connectedPairs.size >= cons.connections.length) {
      // Constellation complete bonus
      setScore((prev: number) => prev + 50);
      if (currentLevel + 1 >= TOTAL_LEVELS) {
        setTimeout(() => callbacks.onGameEnd(scoreRef.current + 50), 1500);
      } else {
        setLevelMessage("Constellation complete! +50 bonus");
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setLevelMessage(
            `Level ${currentLevel + 2}: ${getConstellation(currentLevel + 1).name}`
          );
          setTimeout(() => setLevelMessage(""), 2000);
        }, 1500);
      }
    }
  }, [connectedPairs.size, gameState, currentLevel, setCurrentLevel, setScore, callbacks]);

  // Render loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (gameStateRef.current !== "playing") return;
      pulseRef.current += 0.016;
      const cons = getConstellation(currentLevelRef.current);
      renderStars(
        ctx!,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        cons,
        connectedPairsRef.current,
        bgStarsRef.current,
        draggingRef.current,
        pulseRef.current
      );
      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, currentLevel]);

  const findStarAtPos = useCallback(
    (clientX: number, clientY: number): number | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;

      const cons = getConstellation(currentLevelRef.current);
      for (let i = 0; i < cons.stars.length; i++) {
        const sx = cons.stars[i].x * CANVAS_WIDTH;
        const sy = cons.stars[i].y * CANVAS_HEIGHT;
        const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
        if (dist < STAR_HIT_RADIUS) return i;
      }
      return null;
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return;
      const starIndex = findStarAtPos(e.clientX, e.clientY);
      if (starIndex !== null) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        draggingRef.current = {
          fromIndex: starIndex,
          toX: (e.clientX - rect.left) * scaleX,
          toY: (e.clientY - rect.top) * scaleY,
        };
      }
    },
    [gameState, findStarAtPos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      draggingRef.current = {
        ...draggingRef.current,
        toX: (e.clientX - rect.left) * scaleX,
        toY: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current || gameState !== "playing") {
        draggingRef.current = null;
        return;
      }

      const toStarIndex = findStarAtPos(e.clientX, e.clientY);
      const fromIndex = draggingRef.current.fromIndex;
      draggingRef.current = null;

      if (toStarIndex === null || toStarIndex === fromIndex) return;

      const cons = getConstellation(currentLevelRef.current);
      const key = connectionToKey(fromIndex, toStarIndex);

      if (connectedPairsRef.current.has(key)) return; // already connected

      if (checkConnection(fromIndex, toStarIndex, cons)) {
        addConnection(key);
        setScore((prev: number) => prev + 20);
      } else {
        setFlashWrong(true);
        setTimeout(() => setFlashWrong(false), 300);
      }
    },
    [gameState, findStarAtPos, addConnection, setScore]
  );

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      {/* Header */}
      <div className="flex w-full max-w-[800px] items-center justify-between">
        <div className="text-sm text-text-secondary">
          Level{" "}
          <span className="text-[#b026ff] font-bold">
            {currentLevel + 1}
          </span>{" "}
          / {TOTAL_LEVELS}
          <span className="ml-2 text-text-secondary">
            ({constellation.name})
          </span>
        </div>
        <div className="text-sm">
          <span className="text-text-secondary">Time: </span>
          <span
            className="font-bold"
            style={{ color: timeLeft <= 10 ? "#ff4444" : "#b026ff" }}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          Score: <span className="text-[#b026ff] font-bold">{score}</span>
        </div>
      </div>

      {/* Connections progress */}
      <div className="text-xs text-text-secondary">
        Connections: {connectedPairs.size} / {constellation.connections.length}
      </div>

      {/* Level message overlay */}
      {levelMessage && (
        <div
          className="absolute z-10 rounded-lg border px-6 py-3 text-lg font-bold"
          style={{
            borderColor: "#b026ff",
            backgroundColor: "rgba(10, 10, 46, 0.9)",
            color: "#b026ff",
            textShadow: "0 0 20px #b026ff",
          }}
        >
          {levelMessage}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={`rounded-lg border cursor-crosshair transition-all ${
          flashWrong ? "border-red-500" : "border-border"
        }`}
        style={{ maxWidth: "100%", height: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          draggingRef.current = null;
        }}
      />
    </div>
  );
}
