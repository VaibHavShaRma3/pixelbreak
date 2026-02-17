import { create } from "zustand";

interface MarbleMazeStore {
  level: number;
  elapsedTime: number;
  totalTime: number;
  isComplete: boolean;
  falls: number;

  setElapsed: (t: number) => void;
  completeLevel: (time: number) => void;
  addFall: () => void;
  nextLevel: () => void;
  reset: () => void;
}

const initialState = {
  level: 0,
  elapsedTime: 0,
  totalTime: 0,
  isComplete: false,
  falls: 0,
};

export const useMarbleMazeStore = create<MarbleMazeStore>((set) => ({
  ...initialState,

  setElapsed: (t: number) => set({ elapsedTime: t }),

  completeLevel: (time: number) =>
    set((state) => ({
      isComplete: true,
      totalTime: state.totalTime + time,
    })),

  addFall: () => set((state) => ({ falls: state.falls + 1 })),

  nextLevel: () =>
    set((state) => ({
      level: state.level + 1,
      elapsedTime: 0,
      isComplete: false,
    })),

  reset: () => set({ ...initialState }),
}));
