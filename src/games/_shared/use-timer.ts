import { useState, useRef, useCallback, useEffect } from "react";

interface UseTimerOptions {
  countDown?: boolean;
  initialTime?: number; // seconds
  onComplete?: () => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { countDown = false, initialTime = 0, onComplete } = options;
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const next = countDown ? prev - 1 : prev + 1;
          if (countDown && next <= 0) {
            setRunning(false);
            onComplete?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running, countDown, onComplete]);

  return { time, running, start, stop, reset };
}
