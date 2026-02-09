import { create } from "zustand";

const COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Orange", hex: "#f97316" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Cyan", hex: "#06b6d4" },
];

interface ColorMatchState {
  targetColorName: string;
  targetDisplayColor: string; // The color the text is rendered in (may differ for difficulty)
  options: { name: string; hex: string }[];
  correctIndex: number;
  round: number;
  correct: number;
  wrong: number;
  totalRounds: number;
  generateRound: () => void;
  recordAnswer: (index: number) => boolean;
  reset: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useColorMatchStore = create<ColorMatchState>((set, get) => ({
  targetColorName: "",
  targetDisplayColor: "",
  options: [],
  correctIndex: 0,
  round: 0,
  correct: 0,
  wrong: 0,
  totalRounds: 20,

  generateRound: () => {
    const shuffled = shuffle(COLORS);
    const target = shuffled[0];
    // Display the name in a DIFFERENT color (Stroop effect)
    const displayColor = shuffled[1].hex;
    const opts = shuffle(shuffled.slice(0, 4));
    const correctIdx = opts.findIndex((o) => o.name === target.name);

    set({
      targetColorName: target.name,
      targetDisplayColor: displayColor,
      options: opts,
      correctIndex: correctIdx,
      round: get().round + 1,
    });
  },

  recordAnswer: (index: number) => {
    const state = get();
    const isCorrect = index === state.correctIndex;
    set({
      correct: isCorrect ? state.correct + 1 : state.correct,
      wrong: isCorrect ? state.wrong : state.wrong + 1,
    });
    return isCorrect;
  },

  reset: () =>
    set({
      targetColorName: "",
      targetDisplayColor: "",
      options: [],
      correctIndex: 0,
      round: 0,
      correct: 0,
      wrong: 0,
    }),
}));
