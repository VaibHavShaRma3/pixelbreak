import { create } from "zustand";

interface SyntaxBreakerState {
  currentLevel: number;
  timeLeft: number;
  fixedCount: number;
  totalErrors: number;
  setCurrentLevel: (level: number) => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  incrementFixed: () => void;
  setTotalErrors: (count: number) => void;
  reset: () => void;
}

export const useSyntaxBreakerStore = create<SyntaxBreakerState>((set) => ({
  currentLevel: 0,
  timeLeft: 30,
  fixedCount: 0,
  totalErrors: 5,
  setCurrentLevel: (level) => set({ currentLevel: level, timeLeft: 30 }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  decrementTime: () =>
    set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  incrementFixed: () =>
    set((state) => ({ fixedCount: state.fixedCount + 1 })),
  setTotalErrors: (count) => set({ totalErrors: count }),
  reset: () =>
    set({
      currentLevel: 0,
      timeLeft: 30,
      fixedCount: 0,
      totalErrors: 5,
    }),
}));
