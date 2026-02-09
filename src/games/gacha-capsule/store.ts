import { create } from "zustand";

interface GachaCapsuleState {
  coins: number;
  collection: Map<string, number>;
  totalPulls: number;
  currentAnimation: null | "pulling";
  spendCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
  addItem: (itemId: string) => void;
  incrementPulls: () => void;
  setAnimation: (anim: null | "pulling") => void;
  reset: () => void;
}

export const useGachaCapsuleStore = create<GachaCapsuleState>((set) => ({
  coins: 100,
  collection: new Map<string, number>(),
  totalPulls: 0,
  currentAnimation: null,
  spendCoins: (amount) =>
    set((state) => ({ coins: Math.max(0, state.coins - amount) })),
  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),
  addItem: (itemId) =>
    set((state) => {
      const newCollection = new Map(state.collection);
      newCollection.set(itemId, (newCollection.get(itemId) || 0) + 1);
      return { collection: newCollection };
    }),
  incrementPulls: () =>
    set((state) => ({ totalPulls: state.totalPulls + 1 })),
  setAnimation: (anim) => set({ currentAnimation: anim }),
  reset: () =>
    set({
      coins: 100,
      collection: new Map<string, number>(),
      totalPulls: 0,
      currentAnimation: null,
    }),
}));
