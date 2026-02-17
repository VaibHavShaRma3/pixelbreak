// Grid cell types:
// 0 = empty/hole (marble falls through)
// 1 = wall (tall block)
// 2 = floor (walkable surface)
// 3 = start position (also floor)
// 4 = goal position (also floor)

export interface MazeLevel {
  grid: number[][];
  par: number; // seconds for a perfect run
}

export const LEVELS: MazeLevel[] = [
  // Level 1: Simple 7x7 maze — gentle introduction
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 3, 2, 2, 1, 2, 1],
      [1, 2, 1, 2, 1, 2, 1],
      [1, 2, 1, 2, 2, 2, 1],
      [1, 2, 2, 2, 1, 2, 1],
      [1, 1, 1, 2, 2, 4, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    par: 15,
  },

  // Level 2: 9x9 maze — holes and longer paths
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 2, 1, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 0, 2, 2, 0, 1, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1],
      [1, 2, 2, 2, 1, 2, 0, 2, 1],
      [1, 1, 1, 2, 1, 2, 1, 2, 1],
      [1, 2, 2, 2, 0, 2, 2, 4, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    par: 25,
  },

  // Level 3: 11x11 maze — complex with many holes and dead ends
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 2, 2, 1, 2, 2, 2, 1, 2, 1],
      [1, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1],
      [1, 2, 2, 2, 0, 2, 1, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 0, 1],
      [1, 2, 0, 2, 2, 2, 0, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1],
      [1, 2, 2, 0, 1, 2, 2, 2, 0, 2, 1],
      [1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 0, 2, 2, 0, 2, 4, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    par: 40,
  },
];
