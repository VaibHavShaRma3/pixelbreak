import { create } from "zustand";
import { generateEquation, evaluateGuess, isValidEquation } from "./engine";

type CellResult = "correct" | "present" | "absent" | "empty";

interface NerdleStore {
  answer: string;
  guesses: string[];
  results: CellResult[][];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  maxGuesses: number;
  usedChars: Record<string, CellResult>;
  message: string | null;
  addChar: (ch: string) => void;
  removeChar: () => void;
  submitGuess: () => { valid: boolean; won?: boolean };
  initGame: () => void;
  reset: () => void;
}

export const useNerdleStore = create<NerdleStore>((set, get) => ({
  answer: "",
  guesses: [],
  results: [],
  currentGuess: "",
  gameOver: false,
  won: false,
  maxGuesses: 6,
  usedChars: {},
  message: null,

  addChar: (ch: string) => {
    const state = get();
    if (state.gameOver) return;
    if (state.currentGuess.length >= 8) return;

    set({ currentGuess: state.currentGuess + ch, message: null });
  },

  removeChar: () => {
    const state = get();
    if (state.gameOver) return;
    if (state.currentGuess.length === 0) return;

    set({
      currentGuess: state.currentGuess.slice(0, -1),
      message: null,
    });
  },

  submitGuess: () => {
    const state = get();
    if (state.gameOver) return { valid: false };
    if (state.currentGuess.length !== 8) {
      set({ message: "Not enough characters" });
      return { valid: false };
    }

    if (!isValidEquation(state.currentGuess)) {
      set({ message: "Invalid equation" });
      return { valid: false };
    }

    const result = evaluateGuess(state.currentGuess, state.answer);
    const isWin = result.every((r) => r === "correct");
    const isLastGuess = state.guesses.length + 1 >= state.maxGuesses;

    // Update used chars — keep the "best" result for each character
    // Priority: correct > present > absent
    const newUsedChars = { ...state.usedChars };
    const priority: Record<string, number> = {
      correct: 3,
      present: 2,
      absent: 1,
      empty: 0,
    };

    for (let i = 0; i < 8; i++) {
      const ch = state.currentGuess[i];
      const cellResult = result[i];
      const existing = newUsedChars[ch];
      if (
        !existing ||
        (priority[cellResult] ?? 0) > (priority[existing] ?? 0)
      ) {
        newUsedChars[ch] = cellResult;
      }
    }

    set({
      guesses: [...state.guesses, state.currentGuess],
      results: [...state.results, result],
      currentGuess: "",
      usedChars: newUsedChars,
      gameOver: isWin || isLastGuess,
      won: isWin,
      message: null,
    });

    return { valid: true, won: isWin };
  },

  initGame: () => {
    const answer = generateEquation();
    set({
      answer,
      guesses: [],
      results: [],
      currentGuess: "",
      gameOver: false,
      won: false,
      usedChars: {},
      message: null,
    });
  },

  reset: () =>
    set({
      answer: "",
      guesses: [],
      results: [],
      currentGuess: "",
      gameOver: false,
      won: false,
      usedChars: {},
      message: null,
    }),
}));
