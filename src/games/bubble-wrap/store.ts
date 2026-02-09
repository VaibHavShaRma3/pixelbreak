import { create } from "zustand";

interface BubbleState {
  popped: Set<number>;
  totalBubbles: number;
  pop: (index: number) => void;
  reset: () => void;
}

const GRID_SIZE = 10; // 10x10 grid

export const useBubbleStore = create<BubbleState>((set) => ({
  popped: new Set<number>(),
  totalBubbles: GRID_SIZE * GRID_SIZE,
  pop: (index) =>
    set((state) => {
      const newPopped = new Set(state.popped);
      newPopped.add(index);
      return { popped: newPopped };
    }),
  reset: () => set({ popped: new Set<number>() }),
}));
