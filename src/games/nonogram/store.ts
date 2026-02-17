import { create } from "zustand";
import {
  generatePuzzle,
  checkSolution,
  getPatternIndex,
  type NonogramPuzzle,
} from "./engine";

interface NonogramStore {
  puzzle: NonogramPuzzle | null;
  playerGrid: boolean[]; // player's filled cells
  markedEmpty: Set<number>; // cells explicitly marked as empty (X)
  isComplete: boolean;
  level: number;
  lastPatternIndex: number | undefined;
  toggleFill: (index: number) => void;
  toggleMark: (index: number) => void;
  initPuzzle: () => void;
  reset: () => void;
}

export const useNonogramStore = create<NonogramStore>((set, get) => ({
  puzzle: null,
  playerGrid: [],
  markedEmpty: new Set<number>(),
  isComplete: false,
  level: 1,
  lastPatternIndex: undefined,

  initPuzzle: () => {
    const state = get();
    const puzzle = generatePuzzle(5, state.lastPatternIndex);
    const size = puzzle.size * puzzle.size;

    set({
      puzzle,
      playerGrid: new Array<boolean>(size).fill(false),
      markedEmpty: new Set<number>(),
      isComplete: false,
      lastPatternIndex: getPatternIndex(puzzle.name),
    });
  },

  toggleFill: (index: number) => {
    const state = get();
    if (state.isComplete || !state.puzzle) return;

    const newGrid = [...state.playerGrid];
    newGrid[index] = !newGrid[index];

    // If we're filling a cell, remove it from markedEmpty
    const newMarked = new Set(state.markedEmpty);
    if (newGrid[index]) {
      newMarked.delete(index);
    }

    const solved = checkSolution(newGrid, state.puzzle.solution);

    set({
      playerGrid: newGrid,
      markedEmpty: newMarked,
      isComplete: solved,
    });
  },

  toggleMark: (index: number) => {
    const state = get();
    if (state.isComplete || !state.puzzle) return;

    // If the cell is filled, unfill it first and mark it
    const newGrid = [...state.playerGrid];
    const newMarked = new Set(state.markedEmpty);

    if (newGrid[index]) {
      // Unfill and mark as empty
      newGrid[index] = false;
      newMarked.add(index);
    } else if (newMarked.has(index)) {
      // Already marked — unmark
      newMarked.delete(index);
    } else {
      // Not filled, not marked — mark it
      newMarked.add(index);
    }

    set({
      playerGrid: newGrid,
      markedEmpty: newMarked,
    });
  },

  reset: () =>
    set({
      puzzle: null,
      playerGrid: [],
      markedEmpty: new Set<number>(),
      isComplete: false,
      level: 1,
      lastPatternIndex: undefined,
    }),
}));
