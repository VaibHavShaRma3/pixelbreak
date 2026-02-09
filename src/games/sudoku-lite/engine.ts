// 4x4 Sudoku puzzle generator and validator

type Grid = (number | null)[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate a complete valid 4x4 grid
function generateSolution(): number[] {
  const grid: number[] = new Array(16).fill(0);

  function isValid(grid: number[], pos: number, num: number): boolean {
    const row = Math.floor(pos / 4);
    const col = pos % 4;

    // Check row
    for (let c = 0; c < 4; c++) {
      if (grid[row * 4 + c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 4; r++) {
      if (grid[r * 4 + col] === num) return false;
    }

    // Check 2x2 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 2) * 2;
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 2; c++) {
        if (grid[r * 4 + c] === num) return false;
      }
    }

    return true;
  }

  function solve(pos: number): boolean {
    if (pos === 16) return true;

    const nums = shuffle([1, 2, 3, 4]);
    for (const num of nums) {
      if (isValid(grid, pos, num)) {
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

export function generatePuzzle(cluesToRemove: number = 8): {
  puzzle: Grid;
  solution: number[];
} {
  const solution = generateSolution();
  const puzzle: Grid = [...solution];

  // Remove clues
  const positions = shuffle(
    Array.from({ length: 16 }, (_, i) => i)
  ).slice(0, cluesToRemove);

  for (const pos of positions) {
    puzzle[pos] = null;
  }

  return { puzzle, solution };
}

export function checkSolution(grid: Grid): boolean {
  // All cells filled
  if (grid.some((v) => v === null)) return false;

  // Check rows
  for (let r = 0; r < 4; r++) {
    const row = new Set<number>();
    for (let c = 0; c < 4; c++) {
      row.add(grid[r * 4 + c]!);
    }
    if (row.size !== 4) return false;
  }

  // Check columns
  for (let c = 0; c < 4; c++) {
    const col = new Set<number>();
    for (let r = 0; r < 4; r++) {
      col.add(grid[r * 4 + c]!);
    }
    if (col.size !== 4) return false;
  }

  // Check 2x2 boxes
  for (let br = 0; br < 2; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const box = new Set<number>();
      for (let r = br * 2; r < br * 2 + 2; r++) {
        for (let c = bc * 2; c < bc * 2 + 2; c++) {
          box.add(grid[r * 4 + c]!);
        }
      }
      if (box.size !== 4) return false;
    }
  }

  return true;
}

export function getConflicts(grid: Grid, pos: number, value: number): number[] {
  const conflicts: number[] = [];
  const row = Math.floor(pos / 4);
  const col = pos % 4;

  // Check row
  for (let c = 0; c < 4; c++) {
    const idx = row * 4 + c;
    if (idx !== pos && grid[idx] === value) conflicts.push(idx);
  }

  // Check column
  for (let r = 0; r < 4; r++) {
    const idx = r * 4 + col;
    if (idx !== pos && grid[idx] === value) conflicts.push(idx);
  }

  // Check 2x2 box
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 2) * 2;
  for (let r = boxRow; r < boxRow + 2; r++) {
    for (let c = boxCol; c < boxCol + 2; c++) {
      const idx = r * 4 + c;
      if (idx !== pos && grid[idx] === value) conflicts.push(idx);
    }
  }

  return conflicts;
}
