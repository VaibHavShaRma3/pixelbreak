import { create } from "zustand";
import { generatePuzzle, checkSolution, type KenKenPuzzle } from "./engine";

interface KenKenStore {
  puzzle: KenKenPuzzle | null;
  playerGrid: (number | null)[];
  selectedCell: number | null;
  isComplete: boolean;
  errors: Set<number>;
  setCell: (pos: number, value: number | null) => void;
  selectCell: (pos: number | null) => void;
  initPuzzle: () => void;
  reset: () => void;
}

export const useKenKenStore = create<KenKenStore>((set, get) => ({
  puzzle: null,
  playerGrid: new Array(16).fill(null),
  selectedCell: null,
  isComplete: false,
  errors: new Set<number>(),

  initPuzzle: () => {
    const puzzle = generatePuzzle();
    set({
      puzzle,
      playerGrid: new Array(16).fill(null),
      selectedCell: null,
      isComplete: false,
      errors: new Set<number>(),
    });
  },

  setCell: (pos, value) => {
    const state = get();
    if (state.isComplete || state.puzzle === null) return;

    const newGrid = [...state.playerGrid];
    newGrid[pos] = value;

    // Compute row/column conflict errors
    const size = state.puzzle.size;
    const newErrors = new Set<number>();

    for (let i = 0; i < size * size; i++) {
      const v = newGrid[i];
      if (v === null) continue;

      const row = Math.floor(i / size);
      const col = i % size;

      // Check row duplicates
      for (let c = 0; c < size; c++) {
        const idx = row * size + c;
        if (idx !== i && newGrid[idx] === v) {
          newErrors.add(i);
          newErrors.add(idx);
        }
      }

      // Check column duplicates
      for (let r = 0; r < size; r++) {
        const idx = r * size + col;
        if (idx !== i && newGrid[idx] === v) {
          newErrors.add(i);
          newErrors.add(idx);
        }
      }
    }

    const complete = checkSolution(newGrid, state.puzzle.solution);
    set({ playerGrid: newGrid, errors: newErrors, isComplete: complete });
  },

  selectCell: (pos) => set({ selectedCell: pos }),

  reset: () =>
    set({
      puzzle: null,
      playerGrid: new Array(16).fill(null),
      selectedCell: null,
      isComplete: false,
      errors: new Set<number>(),
    }),
}));
