export interface Level {
  grid: number[][]; // 0=empty/hole, 1=floor, 2=goal, 3=start
  targetFace: number; // which face must be on top at goal (0-5)
  par: number; // moves for perfect score
}

export const LEVELS: Level[] = [
  // Level 1: Simple 4x4, just reach the goal — straight path
  {
    grid: [
      [1, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 1, 1],
      [0, 0, 3, 2],
    ],
    targetFace: 0, // any face on top is fine for level 1 intro
    par: 5,
  },

  // Level 2: 4x4 with more holes requiring a winding path
  {
    grid: [
      [3, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 1],
      [0, 0, 0, 2],
    ],
    targetFace: 2,
    par: 5,
  },

  // Level 3: 5x5 — longer path with dead ends
  {
    grid: [
      [3, 1, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 2],
    ],
    targetFace: 4,
    par: 7,
  },

  // Level 4: 5x5 — branching paths, need correct face orientation
  {
    grid: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 1, 0],
      [1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1],
      [3, 1, 1, 1, 2],
    ],
    targetFace: 3,
    par: 8,
  },

  // Level 5: 6x6 — complex maze with multiple routes
  {
    grid: [
      [3, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 0, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 2],
    ],
    targetFace: 1,
    par: 11,
  },
];
