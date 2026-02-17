import { create } from "zustand";

export type OrbitPhase = "placing" | "simulating" | "done";

interface OrbitStore {
  phase: OrbitPhase;
  planetCount: number;
  maxPlanets: number;
  simTime: number;
  alivePlanets: number;
  score: number;

  setPhase: (phase: OrbitPhase) => void;
  setPlanetCount: (n: number) => void;
  setSimTime: (t: number) => void;
  setAlivePlanets: (n: number) => void;
  setScore: (s: number) => void;
  reset: () => void;
}

const initialState = {
  phase: "placing" as OrbitPhase,
  planetCount: 0,
  maxPlanets: 5,
  simTime: 0,
  alivePlanets: 0,
  score: 0,
};

export const useOrbitStore = create<OrbitStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setPlanetCount: (n) => set({ planetCount: n }),
  setSimTime: (t) => set({ simTime: t }),
  setAlivePlanets: (n) => set({ alivePlanets: n }),
  setScore: (s) => set({ score: s }),
  reset: () => set({ ...initialState }),
}));
