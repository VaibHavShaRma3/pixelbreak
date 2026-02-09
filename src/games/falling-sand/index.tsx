"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFallingSandStore, type ElementType } from "./store";
import {
  createGrid,
  updateGrid,
  renderGrid,
  placeParticle,
  getGridDimensions,
  type Particle,
} from "./engine";
import type { GameState, GameCallbacks } from "@/types/game";

interface FallingSandProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const ELEMENT_COLORS: Record<ElementType, string> = {
  sand: "#c2b280",
  water: "#4444ff",
  fire: "#ff4400",
  wall: "#888888",
  eraser: "#ff0000",
};

export default function FallingSand({
  gameState,
  score,
  setScore,
  callbacks,
}: FallingSandProps) {
  const {
    selectedElement,
    brushSize,
    particleCount,
    setSelectedElement,
    setBrushSize,
    incrementParticleCount,
    reset,
  } = useFallingSandStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Particle[][]>(createGrid());
  const isDrawingRef = useRef(false);
  const animationRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const selectedElementRef = useRef(selectedElement);
  const brushSizeRef = useRef(brushSize);

  gameStateRef.current = gameState;
  selectedElementRef.current = selectedElement;
  brushSizeRef.current = brushSize;

  // Reset grid on game start
  useEffect(() => {
    if (gameState === "playing") {
      gridRef.current = createGrid();
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

    const { width, height, cellSize } = getGridDimensions();

    function loop() {
      if (gameStateRef.current !== "playing") return;
      gridRef.current = updateGrid(gridRef.current);
      renderGrid(ctx!, gridRef.current, CANVAS_WIDTH, CANVAS_HEIGHT);
      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const getGridPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const { cellSize } = getGridDimensions();
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / cellSize);
    return { x, y };
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return;
      const pos = getGridPos(e);
      if (!pos) return;

      const element = selectedElementRef.current;
      const type = element === "eraser" ? "empty" : element;
      const placed = placeParticle(
        gridRef.current,
        pos.x,
        pos.y,
        type as any,
        brushSizeRef.current
      );
      if (placed > 0) {
        incrementParticleCount(placed);
        setScore((prev: number) => prev + placed);
      }
    },
    [gameState, getGridPos, incrementParticleCount, setScore]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true;
      draw(e);
    },
    [draw]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      draw(e);
    },
    [draw]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleFinish = useCallback(() => {
    callbacks.onGameEnd(particleCount);
  }, [callbacks, particleCount]);

  const elements: ElementType[] = ["sand", "water", "fire", "wall", "eraser"];

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {elements.map((el) => (
          <button
            key={el}
            onClick={() => setSelectedElement(el)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-all ${
              selectedElement === el
                ? "border-white bg-white/10"
                : "border-border bg-surface-2 hover:bg-surface-3"
            }`}
            style={{
              borderColor:
                selectedElement === el ? ELEMENT_COLORS[el] : undefined,
              color: ELEMENT_COLORS[el],
              textShadow:
                selectedElement === el
                  ? `0 0 10px ${ELEMENT_COLORS[el]}`
                  : "none",
            }}
          >
            {el}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-text-secondary">Brush:</span>
          {[1, 2, 3].map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`h-6 w-6 rounded text-xs font-bold transition-all ${
                brushSize === size
                  ? "bg-white/20 text-white border border-white/40"
                  : "bg-surface-2 text-text-secondary border border-border"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="ml-4 text-sm text-text-secondary">
          Particles: <span className="text-[#ffe600] font-bold">{particleCount}</span>
        </div>

        {gameState === "playing" && (
          <button
            onClick={handleFinish}
            className="ml-4 rounded-lg border border-[#ffe600] bg-[#ffe600]/10 px-4 py-1.5 text-sm font-medium text-[#ffe600] hover:bg-[#ffe600]/20 transition-all"
          >
            Finish
          </button>
        )}
      </div>

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
    </div>
  );
}
