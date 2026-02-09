import { create } from "zustand";
import { generatePuzzle, checkSolution } from "./engine";

interface SudokuStore {
  puzzle: (number | null)[];
  solution: number[];
  playerGrid: (number | null)[];
  fixedCells: Set<number>;
  selectedCell: number | null;
  isComplete: boolean;
  setCell: (pos: number, value: number | null) => void;
  selectCell: (pos: number | null) => void;
  initPuzzle: () => void;
  reset: () => void;
}

export const useSudokuStore = create<SudokuStore>((set, get) => ({
  puzzle: [],
  solution: [],
  playerGrid: [],
  fixedCells: new Set(),
  selectedCell: null,
  isComplete: false,

  initPuzzle: () => {
    const { puzzle, solution } = generatePuzzle(8);
    const fixed = new Set<number>();
    puzzle.forEach((v, i) => {
      if (v !== null) fixed.add(i);
    });

    set({
      puzzle,
      solution,
      playerGrid: [...puzzle],
      fixedCells: fixed,
      selectedCell: null,
      isComplete: false,
    });
  },

  setCell: (pos, value) => {
    const state = get();
    if (state.fixedCells.has(pos) || state.isComplete) return;

    const newGrid = [...state.playerGrid];
    newGrid[pos] = value;

    const complete = checkSolution(newGrid);
    set({ playerGrid: newGrid, isComplete: complete });
  },

  selectCell: (pos) => set({ selectedCell: pos }),

  reset: () =>
    set({
      puzzle: [],
      solution: [],
      playerGrid: [],
      fixedCells: new Set(),
      selectedCell: null,
      isComplete: false,
    }),
}));
