import { create } from "zustand";
import {
  type StackEngineState,
  createInitialState,
  updateMovingBlock,
  dropBlock,
} from "./engine";

interface StackStore {
  engine: StackEngineState;
  update: () => void;
  drop: () => number; // returns score
  reset: () => void;
}

export const useStackStore = create<StackStore>((set, get) => ({
  engine: createInitialState(),

  update: () => {
    set((state) => ({
      engine: updateMovingBlock(state.engine),
    }));
  },

  drop: () => {
    const newEngine = dropBlock(get().engine);
    set({ engine: newEngine });
    return newEngine.score;
  },

  reset: () => {
    set({ engine: createInitialState() });
  },
}));
