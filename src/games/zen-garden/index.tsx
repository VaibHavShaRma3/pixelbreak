"use client";

import { useEffect, useRef, useCallback } from "react";
import { useZenGardenStore, type ZenTool } from "./store";
import {
  createGardenState,
  addRakePoint,
  addStone,
  addPlant,
  updatePlants,
  render,
  type ZenGardenState as GardenEngineState,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface ZenGardenProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

const TOOL_CONFIG: Record<ZenTool, { label: string; icon: string }> = {
  rake: { label: "Rake", icon: "~" },
  stone: { label: "Stone", icon: "O" },
  plant: { label: "Plant", icon: "Y" },
};

export default function ZenGarden({
  gameState,
  score,
  setScore,
  callbacks,
}: ZenGardenProps) {
  const {
    selectedTool,
    serenityPoints,
    setSelectedTool,
    addSerenityPoints,
    incrementStones,
    incrementPlants,
    reset,
  } = useZenGardenStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gardenRef = useRef<GardenEngineState>(createGardenState());
  const isDrawingRef = useRef(false);
  const animationRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const selectedToolRef = useRef(selectedTool);

  gameStateRef.current = gameState;
  selectedToolRef.current = selectedTool;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      gardenRef.current = createGardenState();
      reset();
      setScore(0);
    }
  }, [gameState, reset, setScore]);

  // Animation loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (gameStateRef.current !== "playing") return;
      updatePlants(gardenRef.current, 1 / 60);
      render(ctx!, gardenRef.current, Date.now());
      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      return { x, y };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return;
      const pos = getCanvasPos(e);
      if (!pos) return;

      const tool = selectedToolRef.current;
      if (tool === "rake") {
        isDrawingRef.current = true;
        const pts = addRakePoint(gardenRef.current, pos.x, pos.y, true);
        addSerenityPoints(pts);
        setScore((prev: number) => prev + pts);
      } else if (tool === "stone") {
        addStone(gardenRef.current, pos.x, pos.y);
        incrementStones();
        addSerenityPoints(5);
        setScore((prev: number) => prev + 5);
      } else if (tool === "plant") {
        addPlant(gardenRef.current, pos.x, pos.y);
        incrementPlants();
        addSerenityPoints(10);
        setScore((prev: number) => prev + 10);
      }
    },
    [gameState, getCanvasPos, addSerenityPoints, incrementStones, incrementPlants, setScore]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || gameState !== "playing") return;
      const pos = getCanvasPos(e);
      if (!pos) return;

      if (selectedToolRef.current === "rake") {
        const pts = addRakePoint(gardenRef.current, pos.x, pos.y, false);
        addSerenityPoints(pts);
        setScore((prev: number) => prev + pts);
      }
    },
    [gameState, getCanvasPos, addSerenityPoints, setScore]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleFinish = useCallback(() => {
    callbacks.onGameEnd(serenityPoints);
  }, [callbacks, serenityPoints]);

  const tools: ZenTool[] = ["rake", "stone", "plant"];

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg border border-border cursor-crosshair"
        style={{ maxWidth: "100%", height: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Tool selector */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tools.map((tool) => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              selectedTool === tool
                ? "border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]"
                : "border-border bg-surface-2 text-muted hover:bg-surface-2/80"
            }`}
            style={{
              textShadow:
                selectedTool === tool ? "0 0 10px #39ff14" : "none",
            }}
          >
            <span className="mr-1 font-mono">{TOOL_CONFIG[tool].icon}</span>
            {TOOL_CONFIG[tool].label}
          </button>
        ))}

        <div className="ml-4 text-sm text-muted">
          Serenity:{" "}
          <span className="font-bold text-[#39ff14]">{serenityPoints}</span>
        </div>

        {gameState === "playing" && (
          <button
            onClick={handleFinish}
            className="ml-4 rounded-lg border border-[#39ff14] bg-[#39ff14]/10 px-4 py-2 text-sm font-medium text-[#39ff14] transition-all hover:bg-[#39ff14]/20"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
