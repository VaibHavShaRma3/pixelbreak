import { create } from "zustand";
import { getRandomPuzzle, checkGroup, closestGroupOverlap } from "./engine";
import type { PuzzleSet, GroupDef } from "./engine";

interface FoundGroup {
  category: string;
  words: string[];
  color: string;
  difficulty: number;
}

interface SubmitResult {
  correct: boolean;
  group?: FoundGroup;
  oneAway?: boolean;
}

interface ConnectionsStore {
  puzzle: PuzzleSet | null;
  shuffledWords: string[];
  selected: Set<string>;
  foundGroups: FoundGroup[];
  mistakes: number;
  maxMistakes: number;
  gameOver: boolean;
  won: boolean;
  shaking: boolean;
  lastFoundGroup: FoundGroup | null;
  oneAway: boolean;

  toggleWord: (word: string) => void;
  submitGuess: () => SubmitResult;
  deselectAll: () => void;
  initPuzzle: () => void;
  reset: () => void;
  clearShaking: () => void;
  clearOneAway: () => void;
  clearLastFound: () => void;
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  puzzle: null,
  shuffledWords: [],
  selected: new Set<string>(),
  foundGroups: [],
  mistakes: 0,
  maxMistakes: 4,
  gameOver: false,
  won: false,
  shaking: false,
  lastFoundGroup: null,
  oneAway: false,

  initPuzzle: () => {
    const { puzzle, shuffledWords } = getRandomPuzzle();
    set({
      puzzle,
      shuffledWords,
      selected: new Set<string>(),
      foundGroups: [],
      mistakes: 0,
      gameOver: false,
      won: false,
      shaking: false,
      lastFoundGroup: null,
      oneAway: false,
    });
  },

  toggleWord: (word: string) => {
    const state = get();
    if (state.gameOver || state.won) return;

    // Don't toggle words that are already found
    const foundWords = state.foundGroups.flatMap((g) => g.words);
    if (foundWords.includes(word)) return;

    const newSelected = new Set(state.selected);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      // Max 4 selected
      if (newSelected.size >= 4) return;
      newSelected.add(word);
    }
    set({ selected: newSelected });
  },

  submitGuess: (): SubmitResult => {
    const state = get();
    if (state.gameOver || state.won || !state.puzzle) {
      return { correct: false };
    }

    const selectedArr = Array.from(state.selected);
    if (selectedArr.length !== 4) return { correct: false };

    const matchedGroup = checkGroup(selectedArr, state.puzzle);

    if (matchedGroup) {
      const foundGroup: FoundGroup = {
        category: matchedGroup.category,
        words: matchedGroup.words,
        color: matchedGroup.color,
        difficulty: matchedGroup.difficulty,
      };

      const newFoundGroups = [...state.foundGroups, foundGroup];

      // Remove found words from the shuffled grid
      const remainingWords = state.shuffledWords.filter(
        (w) => !matchedGroup.words.includes(w)
      );

      const isWon = newFoundGroups.length === 4;

      set({
        foundGroups: newFoundGroups,
        shuffledWords: remainingWords,
        selected: new Set<string>(),
        won: isWon,
        lastFoundGroup: foundGroup,
        oneAway: false,
      });

      return { correct: true, group: foundGroup };
    }

    // Wrong guess
    const overlap = closestGroupOverlap(selectedArr, state.puzzle);
    const isOneAway = overlap === 3;
    const newMistakes = state.mistakes + 1;
    const isGameOver = newMistakes >= state.maxMistakes;

    set({
      mistakes: newMistakes,
      gameOver: isGameOver,
      selected: new Set<string>(),
      shaking: true,
      oneAway: isOneAway,
    });

    return { correct: false, oneAway: isOneAway };
  },

  deselectAll: () => {
    set({ selected: new Set<string>() });
  },

  clearShaking: () => set({ shaking: false }),

  clearOneAway: () => set({ oneAway: false }),

  clearLastFound: () => set({ lastFoundGroup: null }),

  reset: () =>
    set({
      puzzle: null,
      shuffledWords: [],
      selected: new Set<string>(),
      foundGroups: [],
      mistakes: 0,
      gameOver: false,
      won: false,
      shaking: false,
      lastFoundGroup: null,
      oneAway: false,
    }),
}));
