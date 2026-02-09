import { create } from "zustand";

export type ZenTool = "rake" | "stone" | "plant";

interface ZenGardenState {
  selectedTool: ZenTool;
  serenityPoints: number;
  stonesPlaced: number;
  plantsPlaced: number;
  setSelectedTool: (tool: ZenTool) => void;
  addSerenityPoints: (amount: number) => void;
  incrementStones: () => void;
  incrementPlants: () => void;
  reset: () => void;
}

export const useZenGardenStore = create<ZenGardenState>((set) => ({
  selectedTool: "rake",
  serenityPoints: 0,
  stonesPlaced: 0,
  plantsPlaced: 0,
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  addSerenityPoints: (amount) =>
    set((state) => ({ serenityPoints: state.serenityPoints + amount })),
  incrementStones: () =>
    set((state) => ({ stonesPlaced: state.stonesPlaced + 1 })),
  incrementPlants: () =>
    set((state) => ({ plantsPlaced: state.plantsPlaced + 1 })),
  reset: () => ({
    selectedTool: "rake" as ZenTool,
    serenityPoints: 0,
    stonesPlaced: 0,
    plantsPlaced: 0,
  }),
}));
