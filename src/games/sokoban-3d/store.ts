import { create } from "zustand";

interface SokobanStore {
  level: number;
  moves: number;
  totalScore: number;
  isComplete: boolean;
  addMove: () => void;
  completeLevel: (moves: number, par: number) => void;
  nextLevel: () => void;
  reset: () => void;
}

export const useSokobanStore = create<SokobanStore>((set) => ({
  level: 0,
  moves: 0,
  totalScore: 0,
  isComplete: false,

  addMove: () => set((state) => ({ moves: state.moves + 1 })),

  completeLevel: (moves: number, par: number) =>
    set((state) => {
      const score = Math.max(500 - (moves - par) * 20, 100);
      return {
        totalScore: state.totalScore + score,
        isComplete: true,
      };
    }),

  nextLevel: () =>
    set((state) => ({
      level: state.level + 1,
      moves: 0,
      isComplete: false,
    })),

  reset: () =>
    set({
      level: 0,
      moves: 0,
      totalScore: 0,
      isComplete: false,
    }),
}));
