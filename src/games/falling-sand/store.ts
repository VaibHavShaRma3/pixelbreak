import { create } from "zustand";

export type ElementType = "sand" | "water" | "fire" | "wall" | "eraser";

interface FallingSandState {
  selectedElement: ElementType;
  brushSize: number;
  particleCount: number;
  setSelectedElement: (element: ElementType) => void;
  setBrushSize: (size: number) => void;
  incrementParticleCount: (amount: number) => void;
  reset: () => void;
}

export const useFallingSandStore = create<FallingSandState>((set) => ({
  selectedElement: "sand",
  brushSize: 1,
  particleCount: 0,
  setSelectedElement: (element) => set({ selectedElement: element }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(3, size)) }),
  incrementParticleCount: (amount) =>
    set((state) => ({ particleCount: state.particleCount + amount })),
  reset: () => set({ selectedElement: "sand", brushSize: 1, particleCount: 0 }),
}));
