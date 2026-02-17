import { create } from "zustand";
import { generatePattern, checkAnswer, getLevelConfig } from "./engine";

interface MemoryMatrixStore {
  level: number;
  phase: "showing" | "input" | "result";
  gridSize: number;
  pattern: Set<number>;
  selected: Set<number>;
  isCorrect: boolean | null;

  toggleCell: (index: number) => void;
  startLevel: () => void;
  submitGuess: () => boolean;
  reset: () => void;
}

export const useMemoryMatrixStore = create<MemoryMatrixStore>((set, get) => ({
  level: 1,
  phase: "showing",
  gridSize: 3,
  pattern: new Set<number>(),
  selected: new Set<number>(),
  isCorrect: null,

  toggleCell: (index: number) => {
    const state = get();
    if (state.phase !== "input") return;

    const next = new Set(state.selected);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }

    set({ selected: next });
  },

  startLevel: () => {
    const state = get();
    const config = getLevelConfig(state.level);
    const pattern = generatePattern(config.gridSize, config.highlightCount);

    set({
      phase: "showing",
      gridSize: config.gridSize,
      pattern,
      selected: new Set<number>(),
      isCorrect: null,
    });
  },

  submitGuess: () => {
    const state = get();
    const correct = checkAnswer(state.pattern, state.selected);

    set({
      phase: "result",
      isCorrect: correct,
    });

    return correct;
  },

  reset: () =>
    set({
      level: 1,
      phase: "showing",
      gridSize: 3,
      pattern: new Set<number>(),
      selected: new Set<number>(),
      isCorrect: null,
    }),
}));
