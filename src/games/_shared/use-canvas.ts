import { useRef, useEffect, useCallback } from "react";

interface UseCanvasOptions {
  width?: number;
  height?: number;
  pixelRatio?: number;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width = 400, height = 600, pixelRatio = window.devicePixelRatio || 1 } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
  }, [width, height, pixelRatio]);

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext("2d") || null;
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, (canvasRef.current?.width || 0), (canvasRef.current?.height || 0));
      ctx.restore();
    }
  }, [getContext]);

  return { canvasRef, getContext, clearCanvas, width, height };
}
