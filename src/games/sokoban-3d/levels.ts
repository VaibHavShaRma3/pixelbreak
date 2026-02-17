// Grid values: 0=empty, 1=wall, 2=floor, 3=goal, 4=crate, 5=player, 6=crate_on_goal
export interface SokobanLevel {
  grid: number[][];
  par: number; // moves for perfect score
}

export const LEVELS: SokobanLevel[] = [
  // Level 1: Simple 1-crate puzzle (5x5)
  {
    grid: [
      [0, 1, 1, 1, 0],
      [1, 2, 2, 2, 1],
      [1, 2, 4, 2, 1],
      [1, 5, 2, 3, 1],
      [0, 1, 1, 1, 0],
    ],
    par: 4,
  },

  // Level 2: Two crates, straight pushes (6x6)
  {
    grid: [
      [1, 1, 1, 1, 1, 0],
      [1, 2, 2, 2, 1, 0],
      [1, 2, 4, 2, 1, 1],
      [1, 2, 2, 4, 2, 1],
      [1, 5, 2, 3, 3, 1],
      [1, 1, 1, 1, 1, 1],
    ],
    par: 8,
  },

  // Level 3: Two crates, L-shaped room requiring careful sequencing (7x6)
  {
    grid: [
      [0, 1, 1, 1, 1, 0],
      [1, 1, 2, 2, 1, 0],
      [1, 3, 2, 4, 1, 0],
      [1, 3, 2, 4, 2, 1],
      [1, 1, 2, 5, 2, 1],
      [0, 1, 2, 2, 2, 1],
      [0, 1, 1, 1, 1, 1],
    ],
    par: 12,
  },

  // Level 4: Three crates, T-shaped warehouse (7x7)
  {
    grid: [
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 3, 3, 3, 1, 0],
      [1, 1, 2, 2, 2, 1, 1],
      [1, 2, 2, 4, 2, 2, 1],
      [1, 2, 4, 2, 4, 2, 1],
      [1, 2, 2, 5, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    par: 16,
  },

  // Level 5: Three crates, large warehouse (8x8)
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 4, 2, 2, 4, 2, 1],
      [1, 2, 2, 1, 1, 2, 2, 1],
      [1, 2, 2, 1, 2, 2, 3, 1],
      [1, 2, 4, 2, 2, 2, 3, 1],
      [1, 5, 2, 2, 2, 2, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    par: 24,
  },
];
