// Nonogram — pure game logic
// 5x5 grid puzzle where players fill cells based on row/column clues.

export interface NonogramPuzzle {
  size: number; // 5x5 for now
  solution: boolean[]; // flat array, true = filled
  rowClues: number[][]; // clue numbers for each row
  colClues: number[][]; // clue numbers for each column
  name: string; // pattern name for display
}

const SIZE = 5;

// Bank of 8 predefined 5x5 patterns (1 = filled, 0 = empty)
const PATTERN_BANK: { name: string; data: number[] }[] = [
  {
    name: "Heart",
    data: [
      // prettier-ignore
      0, 1, 0, 1, 0,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      0, 1, 1, 1, 0,
      0, 0, 1, 0, 0,
    ],
  },
  {
    name: "Arrow",
    data: [
      // prettier-ignore
      0, 0, 1, 0, 0,
      0, 1, 1, 0, 0,
      1, 1, 1, 1, 1,
      0, 1, 1, 0, 0,
      0, 0, 1, 0, 0,
    ],
  },
  {
    name: "Cross",
    data: [
      // prettier-ignore
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
      1, 1, 1, 1, 1,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
    ],
  },
  {
    name: "Letter T",
    data: [
      // prettier-ignore
      1, 1, 1, 1, 1,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
    ],
  },
  {
    name: "Smiley",
    data: [
      // prettier-ignore
      0, 1, 0, 1, 0,
      0, 1, 0, 1, 0,
      0, 0, 0, 0, 0,
      1, 0, 0, 0, 1,
      0, 1, 1, 1, 0,
    ],
  },
  {
    name: "House",
    data: [
      // prettier-ignore
      0, 0, 1, 0, 0,
      0, 1, 1, 1, 0,
      1, 1, 1, 1, 1,
      1, 1, 0, 1, 1,
      1, 1, 0, 1, 1,
    ],
  },
  {
    name: "Tree",
    data: [
      // prettier-ignore
      0, 0, 1, 0, 0,
      0, 1, 1, 1, 0,
      1, 1, 1, 1, 1,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
    ],
  },
  {
    name: "Diamond",
    data: [
      // prettier-ignore
      0, 0, 1, 0, 0,
      0, 1, 0, 1, 0,
      1, 0, 0, 0, 1,
      0, 1, 0, 1, 0,
      0, 0, 1, 0, 0,
    ],
  },
];

/**
 * Compute row and column clues from a solution grid using run-length encoding.
 * Each clue array contains the lengths of consecutive filled runs in order.
 */
export function computeClues(
  solution: boolean[],
  size: number
): { rowClues: number[][]; colClues: number[][] } {
  const rowClues: number[][] = [];
  const colClues: number[][] = [];

  // Row clues
  for (let r = 0; r < size; r++) {
    const runs: number[] = [];
    let count = 0;
    for (let c = 0; c < size; c++) {
      if (solution[r * size + c]) {
        count++;
      } else {
        if (count > 0) {
          runs.push(count);
          count = 0;
        }
      }
    }
    if (count > 0) runs.push(count);
    rowClues.push(runs.length > 0 ? runs : [0]);
  }

  // Column clues
  for (let c = 0; c < size; c++) {
    const runs: number[] = [];
    let count = 0;
    for (let r = 0; r < size; r++) {
      if (solution[r * size + c]) {
        count++;
      } else {
        if (count > 0) {
          runs.push(count);
          count = 0;
        }
      }
    }
    if (count > 0) runs.push(count);
    colClues.push(runs.length > 0 ? runs : [0]);
  }

  return { rowClues, colClues };
}

/**
 * Generate a nonogram puzzle by picking a random predefined pattern.
 * Optionally exclude a pattern index to avoid repeats.
 */
export function generatePuzzle(
  size: number = SIZE,
  excludeIndex?: number
): NonogramPuzzle {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * PATTERN_BANK.length);
  } while (idx === excludeIndex && PATTERN_BANK.length > 1);

  const pattern = PATTERN_BANK[idx];
  const solution = pattern.data.map((v) => v === 1);
  const { rowClues, colClues } = computeClues(solution, size);

  return {
    size,
    solution,
    rowClues,
    colClues,
    name: pattern.name,
  };
}

/**
 * Check if the player's grid matches the solution.
 * Only filled cells matter — we compare filled positions.
 */
export function checkSolution(
  playerGrid: boolean[],
  solution: boolean[]
): boolean {
  if (playerGrid.length !== solution.length) return false;
  for (let i = 0; i < solution.length; i++) {
    if (playerGrid[i] !== solution[i]) return false;
  }
  return true;
}

/**
 * Get the pattern bank index for a given pattern name (used for exclude logic).
 */
export function getPatternIndex(name: string): number | undefined {
  const idx = PATTERN_BANK.findIndex((p) => p.name === name);
  return idx >= 0 ? idx : undefined;
}
