import { create } from "zustand";

export type GridTool = "pencil" | "fill" | "eraser";

export const COLOR_PALETTE = [
  "#000000", // black
  "#ffffff", // white
  "#ff0000", // red
  "#ff8800", // orange
  "#ffff00", // yellow
  "#00cc00", // green
  "#0044ff", // blue
  "#8800ff", // purple
  "#ff66aa", // pink
  "#00ffff", // cyan
  "#8b4513", // brown
  "#888888", // gray
  "#006600", // dark green
  "#000066", // navy
  "#800000", // maroon
  "#ffd700", // gold
];

interface CommunityGridState {
  selectedColor: string;
  selectedTool: GridTool;
  pixelsPlaced: number;
  setSelectedColor: (color: string) => void;
  setSelectedTool: (tool: GridTool) => void;
  incrementPixelsPlaced: (amount: number) => void;
  reset: () => void;
}

export const useCommunityGridStore = create<CommunityGridState>((set) => ({
  selectedColor: "#ff0000",
  selectedTool: "pencil",
  pixelsPlaced: 0,
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  incrementPixelsPlaced: (amount) =>
    set((state) => ({ pixelsPlaced: state.pixelsPlaced + amount })),
  reset: () =>
    set({ selectedColor: "#ff0000", selectedTool: "pencil", pixelsPlaced: 0 }),
}));
