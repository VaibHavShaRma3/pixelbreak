import { create } from "zustand";

interface LoFiTyperState {
  currentSentenceIndex: number;
  typedChars: number;
  combo: number;
  maxCombo: number;
  mistakes: number;
  nextSentence: () => void;
  incrementTyped: () => void;
  incrementCombo: () => void;
  breakCombo: () => void;
  addMistake: () => void;
  reset: () => void;
}

export const useLoFiTyperStore = create<LoFiTyperState>((set) => ({
  currentSentenceIndex: 0,
  typedChars: 0,
  combo: 0,
  maxCombo: 0,
  mistakes: 0,
  nextSentence: () =>
    set((state) => ({
      currentSentenceIndex: state.currentSentenceIndex + 1,
      typedChars: 0,
    })),
  incrementTyped: () =>
    set((state) => ({ typedChars: state.typedChars + 1 })),
  incrementCombo: () =>
    set((state) => ({
      combo: state.combo + 1,
      maxCombo: Math.max(state.maxCombo, state.combo + 1),
    })),
  breakCombo: () => set({ combo: 0 }),
  addMistake: () =>
    set((state) => ({ mistakes: state.mistakes + 1 })),
  reset: () =>
    set({
      currentSentenceIndex: 0,
      typedChars: 0,
      combo: 0,
      maxCombo: 0,
      mistakes: 0,
    }),
}));
