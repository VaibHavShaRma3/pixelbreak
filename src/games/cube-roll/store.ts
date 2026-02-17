import { create } from "zustand";

interface CubeRollStore {
  level: number;
  moves: number;
  totalScore: number;
  isComplete: boolean;
  message: string;

  addMove: () => void;
  completeLevel: (moves: number, par: number) => void;
  nextLevel: () => void;
  reset: () => void;
  setMessage: (msg: string) => void;
}

const initialState = {
  level: 0,
  moves: 0,
  totalScore: 0,
  isComplete: false,
  message: "",
};

export const useCubeRollStore = create<CubeRollStore>((set) => ({
  ...initialState,

  addMove: () => set((state) => ({ moves: state.moves + 1 })),

  completeLevel: (moves: number, par: number) =>
    set((state) => {
      // Score: par * 100 / moves, capped at 500
      const levelScore = Math.min(500, Math.round((par * 100) / Math.max(1, moves)));
      return {
        totalScore: state.totalScore + levelScore,
        isComplete: true,
        message: `Level complete! +${levelScore} points`,
      };
    }),

  nextLevel: () =>
    set((state) => ({
      level: state.level + 1,
      moves: 0,
      isComplete: false,
      message: "",
    })),

  reset: () => set({ ...initialState }),

  setMessage: (msg: string) => set({ message: msg }),
}));
