import { create } from "zustand";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HanoiStore {
  level: number; // 1 = 3 disks, 2 = 4 disks, 3 = 5 disks
  numDisks: number;
  moves: number;
  minMoves: number; // 2^n - 1
  totalScore: number;
  isComplete: boolean;
  message: string;

  addMove: () => void;
  completeLevel: () => void;
  nextLevel: () => void;
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function disksForLevel(level: number): number {
  return level + 2; // level 1 -> 3 disks, level 2 -> 4, level 3 -> 5
}

function minMovesForDisks(n: number): number {
  return Math.pow(2, n) - 1;
}

function scoreForLevel(moves: number, minMoves: number): number {
  const penalty = (moves - minMoves) * 30;
  return Math.max(500 - penalty, 100);
}

/* ------------------------------------------------------------------ */
/*  Initial state                                                      */
/* ------------------------------------------------------------------ */

const initialLevel = 1;
const initialDisks = disksForLevel(initialLevel);

const initialState = {
  level: initialLevel,
  numDisks: initialDisks,
  moves: 0,
  minMoves: minMovesForDisks(initialDisks),
  totalScore: 0,
  isComplete: false,
  message: "",
};

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useHanoiStore = create<HanoiStore>((set) => ({
  ...initialState,

  addMove: () =>
    set((state) => ({
      moves: state.moves + 1,
    })),

  completeLevel: () =>
    set((state) => {
      const levelScore = scoreForLevel(state.moves, state.minMoves);
      const newTotal = state.totalScore + levelScore;
      const isLastLevel = state.level >= 3;

      return {
        isComplete: true,
        totalScore: newTotal,
        message: isLastLevel
          ? `All levels complete! Final score: ${newTotal}`
          : `Level ${state.level} complete! +${levelScore} points. Press Next to continue.`,
      };
    }),

  nextLevel: () =>
    set((state) => {
      if (state.level >= 3) return state;
      const newLevel = state.level + 1;
      const newDisks = disksForLevel(newLevel);
      return {
        level: newLevel,
        numDisks: newDisks,
        moves: 0,
        minMoves: minMovesForDisks(newDisks),
        isComplete: false,
        message: "",
      };
    }),

  reset: () =>
    set({
      ...initialState,
      // Ensure fresh copies of all values
      moves: 0,
      totalScore: 0,
      isComplete: false,
      message: "",
    }),
}));
