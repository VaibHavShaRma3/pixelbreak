"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  useCommunityGridStore,
  COLOR_PALETTE,
  type GridTool,
} from "./store";
import {
  createGrid,
  clearGrid,
  placePixel,
  erasePixel,
  floodFill,
  render,
  renderHover,
  getCanvasSize,
  type Grid,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface CommunityGridProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const CANVAS_SIZE = getCanvasSize();

const TOOL_LABELS: Record<GridTool, { label: string; icon: string }> = {
  pencil: { label: "Pencil", icon: "\u270E" },
  fill: { label: "Fill", icon: "\u25A7" },
  eraser: { label: "Eraser", icon: "\u2715" },
};

export default function CommunityGrid({
  gameState,
  score,
  setScore,
  callbacks,
}: CommunityGridProps) {
  const {
    selectedColor,
    selectedTool,
    pixelsPlaced,
    setSelectedColor,
    setSelectedTool,
    incrementPixelsPlaced,
    reset,
  } = useCommunityGridStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid>(createGrid());
  const isDrawingRef = useRef(false);
  const gameStateRef = useRef(gameState);
  const selectedColorRef = useRef(selectedColor);
  const selectedToolRef = useRef(selectedTool);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  gameStateRef.current = gameState;
  selectedColorRef.current = selectedColor;
  selectedToolRef.current = selectedTool;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      gridRef.current = createGrid();
      reset();
      setScore(0);
    }
  }, [gameState, reset, setScore]);

  // Render loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (gameStateRef.current !== "playing") return;

      const hover = hoverRef.current;
      if (hover) {
        renderHover(
          ctx!,
          gridRef.current,
          hover.x,
          hover.y,
          selectedColorRef.current,
          selectedToolRef.current
        );
      } else {
        render(ctx!, gridRef.current);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const getGridPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      const x = Math.floor(((e.clientX - rect.left) * scaleX) / 15);
      const y = Math.floor(((e.clientY - rect.top) * scaleY) / 15);
      if (x < 0 || x >= 32 || y < 0 || y >= 32) return null;
      return { x, y };
    },
    []
  );

  const applyTool = useCallback(
    (x: number, y: number) => {
      const tool = selectedToolRef.current;
      const color = selectedColorRef.current;

      if (tool === "pencil") {
        const placed = placePixel(gridRef.current, x, y, color);
        if (placed > 0) {
          incrementPixelsPlaced(placed);
          setScore((prev: number) => prev + placed);
        }
      } else if (tool === "eraser") {
        erasePixel(gridRef.current, x, y);
      } else if (tool === "fill") {
        const filled = floodFill(gridRef.current, x, y, color);
        if (filled > 0) {
          incrementPixelsPlaced(filled);
          setScore((prev: number) => prev + filled);
        }
      }
    },
    [incrementPixelsPlaced, setScore]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return;
      const pos = getGridPos(e);
      if (!pos) return;

      isDrawingRef.current = true;
      applyTool(pos.x, pos.y);
    },
    [gameState, getGridPos, applyTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getGridPos(e);
      hoverRef.current = pos;

      if (!isDrawingRef.current || gameState !== "playing") return;
      if (!pos) return;

      const tool = selectedToolRef.current;
      // Only drag-draw for pencil and eraser
      if (tool === "pencil" || tool === "eraser") {
        applyTool(pos.x, pos.y);
      }
    },
    [gameState, getGridPos, applyTool]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    hoverRef.current = null;
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (showClearConfirm) {
      clearGrid(gridRef.current);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  }, [showClearConfirm]);

  const handleFinish = useCallback(() => {
    callbacks.onGameEnd(pixelsPlaced);
  }, [callbacks, pixelsPlaced]);

  const tools: GridTool[] = ["pencil", "fill", "eraser"];

  return (
    <div className="flex h-full flex-col items-center gap-3 p-4">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="rounded-lg border border-border cursor-crosshair"
        style={{ maxWidth: "480px", width: "100%", height: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Color palette */}
      <div className="flex flex-wrap justify-center gap-1.5" style={{ maxWidth: "480px" }}>
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`h-7 w-7 rounded transition-all ${
              selectedColor === color
                ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-110"
                : "hover:scale-105"
            }`}
            style={{
              backgroundColor: color,
              border:
                color === "#000000"
                  ? "1px solid rgba(255,255,255,0.2)"
                  : "1px solid rgba(0,0,0,0.2)",
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Tools & controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tools.map((tool) => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
              selectedTool === tool
                ? "border-[#00fff5] bg-[#00fff5]/10 text-[#00fff5]"
                : "border-border bg-surface-2 text-muted hover:bg-surface-2/80"
            }`}
            style={{
              textShadow:
                selectedTool === tool ? "0 0 10px #00fff5" : "none",
            }}
          >
            <span className="mr-1">{TOOL_LABELS[tool].icon}</span>
            {TOOL_LABELS[tool].label}
          </button>
        ))}

        <div className="ml-2 text-sm text-muted">
          Pixels:{" "}
          <span className="font-bold text-[#00fff5]">{pixelsPlaced}</span>
        </div>

        <button
          onClick={handleClearCanvas}
          className={`ml-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            showClearConfirm
              ? "border-red-500 bg-red-500/10 text-red-400"
              : "border-border bg-surface-2 text-muted hover:bg-surface-2/80"
          }`}
        >
          {showClearConfirm ? "Confirm Clear?" : "Clear"}
        </button>

        {gameState === "playing" && (
          <button
            onClick={handleFinish}
            className="ml-2 rounded-lg border border-[#00fff5] bg-[#00fff5]/10 px-4 py-1.5 text-sm font-medium text-[#00fff5] transition-all hover:bg-[#00fff5]/20"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
