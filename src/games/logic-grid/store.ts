import { create } from "zustand";
import {
  getRandomPuzzle,
  createEmptyGrid,
  checkSolution,
  getAutoEliminations,
  getCrossGridInferences,
  type PuzzleDefinition,
  type GridState,
  type CellMark,
} from "./engine";

interface LogicGridStore {
  puzzle: PuzzleDefinition | null;
  grid: GridState;
  isComplete: boolean;

  initPuzzle: () => void;
  toggleCell: (subGridKey: string, row: number, col: number) => void;
  reset: () => void;
}

export const useLogicGridStore = create<LogicGridStore>((set, get) => ({
  puzzle: null,
  grid: {},
  isComplete: false,

  initPuzzle: () => {
    const puzzle = getRandomPuzzle();
    set({
      puzzle,
      grid: createEmptyGrid(),
      isComplete: false,
    });
  },

  toggleCell: (subGridKey, row, col) => {
    const state = get();
    if (state.isComplete || !state.puzzle) return;

    const newGrid: GridState = {};
    for (const key of Object.keys(state.grid)) {
      newGrid[key] = state.grid[key].map((r) => [...r]);
    }

    const sg = newGrid[subGridKey];
    if (!sg) return;

    const current = sg[row][col];
    // Cycle: null → yes → no → null
    let next: CellMark;
    if (current === null) next = "yes";
    else if (current === "yes") next = "no";
    else next = null;

    sg[row][col] = next;

    // Auto-eliminate on "yes"
    if (next === "yes") {
      const elims = getAutoEliminations(sg, row, col);
      for (const [er, ec] of elims) {
        sg[er][ec] = "no";
      }
    }

    // Run cross-grid inference (may chain)
    let changed = true;
    while (changed) {
      changed = false;
      const inferences = getCrossGridInferences(newGrid);
      for (const inf of inferences) {
        const target = newGrid[inf.key];
        if (!target) continue;
        if (target[inf.row][inf.col] !== inf.mark) {
          target[inf.row][inf.col] = inf.mark;
          changed = true;
          // Also auto-eliminate for inferred "yes"
          if (inf.mark === "yes") {
            const elims = getAutoEliminations(target, inf.row, inf.col);
            for (const [er, ec] of elims) {
              target[er][ec] = "no";
            }
          }
        }
      }
    }

    const complete = checkSolution(newGrid, state.puzzle);
    set({ grid: newGrid, isComplete: complete });
  },

  reset: () =>
    set({
      puzzle: null,
      grid: {},
      isComplete: false,
    }),
}));
