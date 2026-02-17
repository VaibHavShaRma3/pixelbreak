import { create } from "zustand";
import { generateSequence, checkAnswer, type Sequence } from "./engine";

interface SequenceSolverStore {
  currentSequence: Sequence | null;
  round: number;
  totalRounds: number;
  input: string;
  feedback: "correct" | "wrong" | null;
  setInput: (val: string) => void;
  submitAnswer: () => boolean;
  nextRound: () => void;
  initGame: () => void;
  reset: () => void;
}

function getDifficulty(round: number): number {
  if (round <= 3) return 1;
  if (round <= 7) return 2;
  return 3;
}

export const useSequenceSolverStore = create<SequenceSolverStore>(
  (set, get) => ({
    currentSequence: null,
    round: 0,
    totalRounds: 10,
    input: "",
    feedback: null,

    setInput: (val: string) => set({ input: val }),

    submitAnswer: () => {
      const { currentSequence, input } = get();
      if (!currentSequence || input.trim() === "") return false;

      const parsed = parseInt(input.trim(), 10);
      if (isNaN(parsed)) return false;

      const isCorrect = checkAnswer(currentSequence, parsed);
      set({ feedback: isCorrect ? "correct" : "wrong" });
      return isCorrect;
    },

    nextRound: () => {
      const { round, totalRounds } = get();
      const nextRound = round + 1;

      if (nextRound > totalRounds) {
        // Game over — handled by the component
        set({ round: nextRound, input: "", feedback: null });
        return;
      }

      const difficulty = getDifficulty(nextRound);
      const sequence = generateSequence(difficulty);
      set({
        currentSequence: sequence,
        round: nextRound,
        input: "",
        feedback: null,
      });
    },

    initGame: () => {
      const difficulty = getDifficulty(1);
      const sequence = generateSequence(difficulty);
      set({
        currentSequence: sequence,
        round: 1,
        input: "",
        feedback: null,
      });
    },

    reset: () =>
      set({
        currentSequence: null,
        round: 0,
        input: "",
        feedback: null,
      }),
  })
);
