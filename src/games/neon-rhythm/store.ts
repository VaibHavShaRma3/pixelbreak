import { create } from "zustand";

export interface Note {
  id: number;
  lane: number; // 0-3
  targetTime: number; // ms from song start when note should be hit
  hit: boolean;
  missed: boolean;
  rating: "perfect" | "good" | null;
}

interface NeonRhythmState {
  notes: Note[];
  songIndex: number;
  combo: number;
  maxCombo: number;
  score: number;
  hitCount: number;
  missCount: number;
  perfectCount: number;
  goodCount: number;
  songStartTime: number;
  songDuration: number;
  playing: boolean;
  loadSong: (index: number) => void;
  hitNote: (noteId: number, rating: "perfect" | "good") => void;
  missNote: (noteId: number) => void;
  setSongStartTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

// Generate 3 songs with different patterns
function generateSongNotes(songIndex: number): { notes: Note[]; duration: number } {
  const notes: Note[] = [];
  let id = 0;

  if (songIndex === 0) {
    // Song 1: "Neon Pulse" - steady 4-lane pattern, ~35 notes, 45s
    const patterns = [
      // [time_offset_ms, lane]
      [0, 0], [400, 1], [800, 2], [1200, 3],
      [2000, 0], [2000, 2], [2400, 1], [2400, 3],
      [3200, 0], [3600, 1], [4000, 2], [4400, 3],
      [5200, 1], [5600, 2], [6000, 1], [6400, 0],
      [7200, 0], [7200, 3], [7600, 1], [7600, 2],
      [8400, 3], [8800, 2], [9200, 1], [9600, 0],
      [10400, 0], [10800, 1], [11200, 2], [11600, 3],
      [12400, 1], [12400, 2], [12800, 0], [12800, 3],
      [13600, 0], [14000, 2], [14400, 1],
    ];
    for (const [time, lane] of patterns) {
      notes.push({ id: id++, lane, targetTime: time + 2000, hit: false, missed: false, rating: null });
    }
    return { notes, duration: 18000 };
  }

  if (songIndex === 1) {
    // Song 2: "Cyber Chase" - faster, alternating, ~38 notes, 50s
    const patterns = [
      [0, 0], [300, 1], [600, 2], [900, 3],
      [1200, 3], [1500, 2], [1800, 1], [2100, 0],
      [2700, 0], [2700, 1], [3000, 2], [3000, 3],
      [3600, 1], [3900, 0], [4200, 3], [4500, 2],
      [5100, 0], [5400, 2], [5700, 0], [6000, 3],
      [6600, 1], [6600, 2], [6900, 0], [6900, 3],
      [7500, 0], [7800, 1], [8100, 2], [8400, 3],
      [8700, 2], [9000, 1], [9300, 0], [9600, 1],
      [10200, 0], [10200, 3], [10500, 1], [10500, 2],
      [11100, 2], [11400, 0],
    ];
    for (const [time, lane] of patterns) {
      notes.push({ id: id++, lane, targetTime: time + 2000, hit: false, missed: false, rating: null });
    }
    return { notes, duration: 15000 };
  }

  // Song 3: "Pixel Storm" - complex patterns, ~40 notes, 55s
  const patterns = [
    [0, 1], [200, 2], [400, 0], [600, 3],
    [1000, 0], [1000, 1], [1000, 2], [1000, 3],
    [1800, 0], [2100, 1], [2400, 2], [2700, 3],
    [3000, 3], [3300, 2], [3600, 1], [3900, 0],
    [4500, 0], [4500, 3], [4800, 1], [4800, 2],
    [5400, 2], [5600, 1], [5800, 0], [6000, 3],
    [6300, 1], [6300, 2], [6600, 0], [6600, 3],
    [7200, 0], [7400, 1], [7600, 2], [7800, 3],
    [8400, 3], [8400, 0], [8700, 1], [8700, 2],
    [9300, 0], [9600, 2], [9900, 1], [10200, 3],
  ];
  for (const [time, lane] of patterns) {
    notes.push({ id: id++, lane, targetTime: time + 2000, hit: false, missed: false, rating: null });
  }
  return { notes, duration: 14000 };
}

export const SONG_NAMES = ["Neon Pulse", "Cyber Chase", "Pixel Storm"];

export const useNeonRhythmStore = create<NeonRhythmState>((set, get) => ({
  notes: [],
  songIndex: 0,
  combo: 0,
  maxCombo: 0,
  score: 0,
  hitCount: 0,
  missCount: 0,
  perfectCount: 0,
  goodCount: 0,
  songStartTime: 0,
  songDuration: 0,
  playing: false,

  loadSong: (index: number) => {
    const { notes, duration } = generateSongNotes(index);
    set({
      notes,
      songIndex: index,
      songDuration: duration,
      combo: 0,
      maxCombo: 0,
      score: 0,
      hitCount: 0,
      missCount: 0,
      perfectCount: 0,
      goodCount: 0,
      songStartTime: 0,
      playing: false,
    });
  },

  hitNote: (noteId: number, rating: "perfect" | "good") => {
    const state = get();
    const points = rating === "perfect" ? 100 : 50;
    const comboBonus = Math.floor(state.combo / 5) * 10;
    const newCombo = state.combo + 1;
    set({
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, hit: true, rating } : n
      ),
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      score: state.score + points + comboBonus,
      hitCount: state.hitCount + 1,
      perfectCount: rating === "perfect" ? state.perfectCount + 1 : state.perfectCount,
      goodCount: rating === "good" ? state.goodCount + 1 : state.goodCount,
    });
  },

  missNote: (noteId: number) => {
    const state = get();
    set({
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, missed: true } : n
      ),
      combo: 0,
      missCount: state.missCount + 1,
    });
  },

  setSongStartTime: (time: number) => set({ songStartTime: time }),
  setPlaying: (playing: boolean) => set({ playing }),

  reset: () =>
    set({
      notes: [],
      songIndex: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      hitCount: 0,
      missCount: 0,
      perfectCount: 0,
      goodCount: 0,
      songStartTime: 0,
      songDuration: 0,
      playing: false,
    }),
}));
