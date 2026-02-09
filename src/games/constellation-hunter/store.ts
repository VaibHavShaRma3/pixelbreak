import { create } from "zustand";

interface ConstellationHunterState {
  currentLevel: number;
  connectedPairs: Set<string>;
  score: number;
  timeLeft: number;
  setCurrentLevel: (level: number) => void;
  addConnection: (pair: string) => void;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  reset: () => void;
}

export const useConstellationHunterStore = create<ConstellationHunterState>((set) => ({
  currentLevel: 0,
  connectedPairs: new Set<string>(),
  score: 0,
  timeLeft: 45,
  setCurrentLevel: (level) =>
    set({ currentLevel: level, connectedPairs: new Set<string>(), timeLeft: 45 }),
  addConnection: (pair) =>
    set((state) => {
      const newPairs = new Set(state.connectedPairs);
      newPairs.add(pair);
      return { connectedPairs: newPairs };
    }),
  setScore: (score) => set({ score }),
  addScore: (points) =>
    set((state) => ({ score: state.score + points })),
  setTimeLeft: (time) => set({ timeLeft: time }),
  decrementTime: () =>
    set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  reset: () =>
    set({
      currentLevel: 0,
      connectedPairs: new Set<string>(),
      score: 0,
      timeLeft: 45,
    }),
}));
