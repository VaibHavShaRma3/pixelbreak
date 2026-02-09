import { create } from "zustand";

interface DailyPixelPuzzleState {
  revealedTiles: Set<number>;
  currentPuzzleIndex: number;
  guessed: boolean;
  correctAnswer: string;
  revealTile: (index: number) => void;
  setPuzzleIndex: (index: number) => void;
  setGuessed: (guessed: boolean) => void;
  setCorrectAnswer: (answer: string) => void;
  reset: () => void;
}

export const useDailyPixelPuzzleStore = create<DailyPixelPuzzleState>((set) => ({
  revealedTiles: new Set<number>(),
  currentPuzzleIndex: 0,
  guessed: false,
  correctAnswer: "",
  revealTile: (index) =>
    set((state) => {
      const newRevealed = new Set(state.revealedTiles);
      newRevealed.add(index);
      return { revealedTiles: newRevealed };
    }),
  setPuzzleIndex: (index) => set({ currentPuzzleIndex: index }),
  setGuessed: (guessed) => set({ guessed }),
  setCorrectAnswer: (answer) => set({ correctAnswer: answer }),
  reset: () =>
    set({
      revealedTiles: new Set<number>(),
      guessed: false,
    }),
}));
