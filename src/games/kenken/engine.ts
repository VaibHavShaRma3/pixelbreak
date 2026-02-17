// KenKen puzzle generator and validator for a 4x4 grid

export interface Cage {
  cells: number[];    // flat indices in the 4x4 grid
  target: number;     // target value
  operation: string;  // "+", "-", "×", "÷", or "" (single cell)
}

export interface KenKenPuzzle {
  size: number;       // always 4
  solution: number[]; // flat array of the solution (length 16)
  cages: Cage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// 1. Generate a valid 4x4 Latin square via backtracking with randomization
// ---------------------------------------------------------------------------

function generateLatinSquare(): number[] {
  const grid: number[] = new Array(16).fill(0);

  function isValid(pos: number, num: number): boolean {
    const row = Math.floor(pos / 4);
    const col = pos % 4;

    for (let c = 0; c < 4; c++) {
      if (grid[row * 4 + c] === num) return false;
    }
    for (let r = 0; r < 4; r++) {
      if (grid[r * 4 + col] === num) return false;
    }
    return true;
  }

  function solve(pos: number): boolean {
    if (pos === 16) return true;
    const nums = shuffle([1, 2, 3, 4]);
    for (const num of nums) {
      if (isValid(pos, num)) {
        grid[pos] = num;
        if (solve(pos + 1)) return true;
        grid[pos] = 0;
      }
    }
    return false;
  }

  solve(0);
  return grid;
}

// ---------------------------------------------------------------------------
// 2. Partition cells into cages using random flood-fill / adjacent grouping
// ---------------------------------------------------------------------------

function getNeighbors(index: number, size: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];
  if (row > 0) neighbors.push((row - 1) * size + col);
  if (row < size - 1) neighbors.push((row + 1) * size + col);
  if (col > 0) neighbors.push(row * size + (col - 1));
  if (col < size - 1) neighbors.push(row * size + (col + 1));
  return neighbors;
}

function partitionIntoCages(size: number): number[][] {
  const total = size * size;
  const assigned = new Array(total).fill(false);
  const cages: number[][] = [];

  // Process cells in a random order
  const order = shuffle(Array.from({ length: total }, (_, i) => i));

  for (const start of order) {
    if (assigned[start]) continue;

    // Decide cage size: 1, 2, or 3
    const maxSize = Math.random() < 0.15 ? 1 : Math.random() < 0.5 ? 2 : 3;
    const cage: number[] = [start];
    assigned[start] = true;

    // Grow the cage by randomly picking adjacent unassigned cells
    while (cage.length < maxSize) {
      const candidates: number[] = [];
      for (const cell of cage) {
        for (const n of getNeighbors(cell, size)) {
          if (!assigned[n] && !cage.includes(n)) {
            candidates.push(n);
          }
        }
      }
      if (candidates.length === 0) break;
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      cage.push(next);
      assigned[next] = true;
    }

    cages.push(cage);
  }

  return cages;
}

// ---------------------------------------------------------------------------
// 3. Assign operations and compute targets for each cage
// ---------------------------------------------------------------------------

function assignOperation(
  cageCells: number[],
  solution: number[]
): { target: number; operation: string } {
  const values = cageCells.map((i) => solution[i]);

  // Single cell — no operation
  if (values.length === 1) {
    return { target: values[0], operation: "" };
  }

  // 3 cells — only + or ×
  if (values.length === 3) {
    if (Math.random() < 0.5) {
      return {
        target: values.reduce((a, b) => a + b, 0),
        operation: "+",
      };
    } else {
      return {
        target: values.reduce((a, b) => a * b, 1),
        operation: "×",
      };
    }
  }

  // 2 cells — pick from +, -, ×, ÷
  const [a, b] = values;
  const ops: { target: number; operation: string }[] = [
    { target: a + b, operation: "+" },
    { target: a * b, operation: "×" },
  ];

  // Subtraction — only if result is positive
  const diff = Math.abs(a - b);
  if (diff > 0) {
    ops.push({ target: diff, operation: "-" });
  }

  // Division — only if cleanly divisible
  const [big, small] = a >= b ? [a, b] : [b, a];
  if (small !== 0 && big % small === 0) {
    ops.push({ target: big / small, operation: "÷" });
  }

  return ops[Math.floor(Math.random() * ops.length)];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generatePuzzle(): KenKenPuzzle {
  const size = 4;
  const solution = generateLatinSquare();
  const cellGroups = partitionIntoCages(size);

  const cages: Cage[] = cellGroups.map((cells) => {
    const { target, operation } = assignOperation(cells, solution);
    return { cells, target, operation };
  });

  return { size, solution, cages };
}

/**
 * Check if the player's grid matches the solution exactly.
 */
export function checkSolution(
  grid: (number | null)[],
  solution: number[]
): boolean {
  if (grid.length !== solution.length) return false;
  return grid.every((v, i) => v === solution[i]);
}

/**
 * Check row/column Latin-square constraints for a placement.
 * Returns true if placing `value` at `pos` does not conflict with any
 * already-filled cell in the same row or column.
 */
export function isValidPlacement(
  grid: (number | null)[],
  pos: number,
  value: number,
  size: number
): boolean {
  const row = Math.floor(pos / size);
  const col = pos % size;

  // Check row
  for (let c = 0; c < size; c++) {
    const idx = row * size + c;
    if (idx !== pos && grid[idx] === value) return false;
  }

  // Check column
  for (let r = 0; r < size; r++) {
    const idx = r * size + col;
    if (idx !== pos && grid[idx] === value) return false;
  }

  return true;
}
