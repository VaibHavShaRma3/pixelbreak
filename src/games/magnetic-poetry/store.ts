import { create } from "zustand";

export interface MagnetWord {
  id: string;
  text: string;
  x: number;
  y: number;
  onBoard: boolean;
}

const WORD_BANK = [
  "the", "a", "is", "love", "night", "sky", "dream", "moon", "star",
  "light", "dark", "heart", "soul", "fire", "water", "wind", "you",
  "me", "we", "they", "my", "your", "in", "on", "of", "to", "and",
  "but", "or", "not", "if", "when", "where", "why", "how", "beautiful",
  "broken", "silent", "wild", "gentle", "burning", "falling", "whisper",
  "dance", "sing", "fly", "run", "hold", "forget", "remember", "always",
  "never", "forever", "today", "time", "hope", "lost", "found", "tears",
  "joy", "rain",
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createWords(): MagnetWord[] {
  return shuffleArray(WORD_BANK).map((text, i) => ({
    id: `word-${i}-${text}`,
    text,
    x: 0,
    y: 0,
    onBoard: false,
  }));
}

interface MagneticPoetryState {
  words: MagnetWord[];
  wordsOnBoard: number;
  moveWordToBoard: (id: string, x: number, y: number) => void;
  moveWord: (id: string, x: number, y: number) => void;
  shuffleWords: () => void;
  reset: () => void;
}

export const useMagneticPoetryStore = create<MagneticPoetryState>((set) => ({
  words: createWords(),
  wordsOnBoard: 0,
  moveWordToBoard: (id, x, y) =>
    set((state) => {
      const words = state.words.map((w) =>
        w.id === id ? { ...w, x, y, onBoard: true } : w
      );
      return { words, wordsOnBoard: words.filter((w) => w.onBoard).length };
    }),
  moveWord: (id, x, y) =>
    set((state) => ({
      words: state.words.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),
  shuffleWords: () =>
    set(() => {
      const words = createWords();
      return { words, wordsOnBoard: 0 };
    }),
  reset: () =>
    set(() => {
      const words = createWords();
      return { words, wordsOnBoard: 0 };
    }),
}));
