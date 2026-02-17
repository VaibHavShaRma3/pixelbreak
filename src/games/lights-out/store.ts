import { create } from "zustand";
import {
  generatePuzzle,
  toggleCell,
  isSolved,
  getToggleCountForLevel,
} from "./engine";

interface LightsOutStore {
  grid: boolean[];
  moves: number;
  level: number;
  isComplete: boolean;
  toggle: (index: number) => void;
  initPuzzle: (level?: number) => void;
  reset: () => void;
}

export const useLightsOutStore = create<LightsOutStore>((set, get) => ({
  grid: [],
  moves: 0,
  level: 1,
  isComplete: false,

  initPuzzle: (level?: number) => {
    const lvl = level ?? get().level;
    const toggleCount = getToggleCountForLevel(lvl);
    const grid = generatePuzzle(toggleCount);

    set({
      grid,
      moves: 0,
      level: lvl,
      isComplete: false,
    });
  },

  toggle: (index: number) => {
    const state = get();
    if (state.isComplete) return;

    const newGrid = toggleCell(state.grid, index);
    const solved = isSolved(newGrid);

    set({
      grid: newGrid,
      moves: state.moves + 1,
      isComplete: solved,
    });
  },

  reset: () =>
    set({
      grid: [],
      moves: 0,
      level: 1,
      isComplete: false,
    }),
}));
