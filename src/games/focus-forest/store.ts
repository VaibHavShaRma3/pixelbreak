import { create } from "zustand";

export type TreeStage = "seed" | "sprout" | "sapling" | "young" | "full";

interface FocusForestState {
  elapsedSeconds: number;
  isGrowing: boolean;
  previousTrees: number[]; // durations of past trees
  setElapsedSeconds: (s: number) => void;
  setIsGrowing: (g: boolean) => void;
  addPreviousTree: (duration: number) => void;
  reset: () => void;
}

export const useFocusForestStore = create<FocusForestState>((set) => ({
  elapsedSeconds: 0,
  isGrowing: false,
  previousTrees: [],
  setElapsedSeconds: (s) => set({ elapsedSeconds: s }),
  setIsGrowing: (g) => set({ isGrowing: g }),
  addPreviousTree: (duration) =>
    set((state) => ({ previousTrees: [...state.previousTrees, duration] })),
  reset: () => set({ elapsedSeconds: 0, isGrowing: false }),
}));

export function getTreeStage(elapsedSeconds: number): TreeStage {
  // Scale stages: each 300 seconds (5 min) is a stage, cap at 4 (full tree)
  const stage = Math.floor(elapsedSeconds / 300);
  const stages: TreeStage[] = ["seed", "sprout", "sapling", "young", "full"];
  return stages[Math.min(stage, 4)];
}

export function getGrowthProgress(elapsedSeconds: number): number {
  // 0-1 growth over 25 minutes (1500 seconds)
  return Math.min(1, elapsedSeconds / 1500);
}
