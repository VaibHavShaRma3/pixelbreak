import { create } from "zustand";

type PetMood = "happy" | "neutral" | "sad" | "sleeping" | "eating" | "playing";

interface WorkspacePetState {
  name: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  mood: PetMood;
  totalInteractions: number;
  lastAction: string | null;
  feed: () => void;
  play: () => void;
  sleep: () => void;
  pet: () => void;
  decayStats: (delta: number) => void;
  updateMood: () => void;
  reset: () => void;
}

function getMood(hunger: number, happiness: number, energy: number): PetMood {
  if (energy < 15) return "sleeping";
  if (happiness >= 60 && hunger >= 40) return "happy";
  if (happiness < 30 || hunger < 20) return "sad";
  return "neutral";
}

export const useWorkspacePetStore = create<WorkspacePetState>((set, get) => ({
  name: "Pixel",
  hunger: 70,
  happiness: 70,
  energy: 70,
  mood: "happy",
  totalInteractions: 0,
  lastAction: null,

  feed: () => {
    const state = get();
    if (state.energy < 5) return;
    set({
      hunger: Math.min(100, state.hunger + 30),
      energy: Math.max(0, state.energy - 5),
      mood: "eating",
      totalInteractions: state.totalInteractions + 1,
      lastAction: "feed",
    });
    setTimeout(() => {
      const s = get();
      set({ mood: getMood(s.hunger, s.happiness, s.energy) });
    }, 800);
  },

  play: () => {
    const state = get();
    if (state.energy < 10) return;
    set({
      happiness: Math.min(100, state.happiness + 25),
      energy: Math.max(0, state.energy - 10),
      hunger: Math.max(0, state.hunger - 15),
      mood: "playing",
      totalInteractions: state.totalInteractions + 1,
      lastAction: "play",
    });
    setTimeout(() => {
      const s = get();
      set({ mood: getMood(s.hunger, s.happiness, s.energy) });
    }, 800);
  },

  sleep: () => {
    const state = get();
    set({
      energy: Math.min(100, state.energy + 50),
      mood: "sleeping",
      totalInteractions: state.totalInteractions + 1,
      lastAction: "sleep",
    });
    setTimeout(() => {
      const s = get();
      set({ mood: getMood(s.hunger, s.happiness, s.energy) });
    }, 1500);
  },

  pet: () => {
    const state = get();
    set({
      happiness: Math.min(100, state.happiness + 10),
      totalInteractions: state.totalInteractions + 1,
      lastAction: "pet",
    });
    setTimeout(() => {
      const s = get();
      set({ mood: getMood(s.hunger, s.happiness, s.energy) });
    }, 600);
  },

  decayStats: (delta: number) => {
    const state = get();
    const decayRate = delta * 2; // ~2 points per second
    set({
      hunger: Math.max(0, state.hunger - decayRate * 0.8),
      happiness: Math.max(0, state.happiness - decayRate * 0.5),
      energy: Math.max(0, state.energy - decayRate * 0.3),
    });
  },

  updateMood: () => {
    const state = get();
    if (state.mood === "eating" || state.mood === "playing" || state.mood === "sleeping") return;
    set({ mood: getMood(state.hunger, state.happiness, state.energy) });
  },

  reset: () =>
    set({
      name: "Pixel",
      hunger: 70,
      happiness: 70,
      energy: 70,
      mood: "happy",
      totalInteractions: 0,
      lastAction: null,
    }),
}));
