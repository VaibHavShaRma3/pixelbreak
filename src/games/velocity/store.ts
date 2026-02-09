import { create } from "zustand";

export type RaceState = "waiting" | "countdown" | "racing" | "finished";

interface VelocityStore {
  // HUD state (mirrored from engine for React rendering)
  speed: number;
  maxSpeed: number;
  lap: number;
  totalLaps: number;
  position: number;
  totalRacers: number;
  countdown: number;
  raceState: RaceState;
  driftActive: boolean;
  driftCharge: number;
  bestLapTime: number;
  currentLapTime: number;
  totalRaceTime: number;
  lapTimes: number[];

  // AI positions for minimap (normalized 0-1 along track × laps)
  racerProgress: number[];

  // Actions
  setSpeed: (speed: number) => void;
  setLap: (lap: number) => void;
  setPosition: (position: number) => void;
  setCountdown: (countdown: number) => void;
  setRaceState: (raceState: RaceState) => void;
  setDrift: (active: boolean, charge: number) => void;
  setBestLapTime: (time: number) => void;
  setCurrentLapTime: (time: number) => void;
  setTotalRaceTime: (time: number) => void;
  addLapTime: (time: number) => void;
  setRacerProgress: (progress: number[]) => void;
  reset: () => void;
}

const initialState = {
  speed: 0,
  maxSpeed: 200,
  lap: 1,
  totalLaps: 3,
  position: 8,
  totalRacers: 8,
  countdown: 3,
  raceState: "waiting" as RaceState,
  driftActive: false,
  driftCharge: 0,
  bestLapTime: 0,
  currentLapTime: 0,
  totalRaceTime: 0,
  lapTimes: [] as number[],
  racerProgress: [] as number[],
};

export const useVelocityStore = create<VelocityStore>((set) => ({
  ...initialState,

  setSpeed: (speed) => set({ speed }),
  setLap: (lap) => set({ lap }),
  setPosition: (position) => set({ position }),
  setCountdown: (countdown) => set({ countdown }),
  setRaceState: (raceState) => set({ raceState }),
  setDrift: (active, charge) => set({ driftActive: active, driftCharge: charge }),
  setBestLapTime: (time) => set({ bestLapTime: time }),
  setCurrentLapTime: (time) => set({ currentLapTime: time }),
  setTotalRaceTime: (time) => set({ totalRaceTime: time }),
  addLapTime: (time) =>
    set((state) => ({
      lapTimes: [...state.lapTimes, time],
      bestLapTime:
        state.bestLapTime === 0 ? time : Math.min(state.bestLapTime, time),
    })),
  setRacerProgress: (progress) => set({ racerProgress: progress }),
  reset: () => set({ ...initialState, lapTimes: [], racerProgress: [] }),
}));
