import { useRef, useEffect, useCallback } from "react";

type GameLoopCallback = (deltaTime: number) => void;

export function useGameLoop(callback: GameLoopCallback, running: boolean) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  callbackRef.current = callback;

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // seconds
    lastTimeRef.current = timestamp;

    callbackRef.current(deltaTime);
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [running, loop]);
}
