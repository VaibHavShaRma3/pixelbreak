// Lights Out — pure game logic
// 5x5 grid of booleans (true = lit, false = off). Goal: turn all lights off.

const SIZE = 5;
const TOTAL = SIZE * SIZE;

/**
 * Get the indices that are affected when toggling a cell:
 * the cell itself + its orthogonal (up/down/left/right) neighbors.
 */
export function getNeighbors(index: number): number[] {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const neighbors = [index];

  if (row > 0) neighbors.push((row - 1) * SIZE + col); // up
  if (row < SIZE - 1) neighbors.push((row + 1) * SIZE + col); // down
  if (col > 0) neighbors.push(row * SIZE + (col - 1)); // left
  if (col < SIZE - 1) neighbors.push(row * SIZE + (col + 1)); // right

  return neighbors;
}

/**
 * Toggle a cell and its orthogonal neighbors. Returns a new grid.
 */
export function toggleCell(grid: boolean[], index: number): boolean[] {
  const next = [...grid];
  for (const i of getNeighbors(index)) {
    next[i] = !next[i];
  }
  return next;
}

/**
 * Check if the puzzle is solved (all lights off).
 */
export function isSolved(grid: boolean[]): boolean {
  return grid.every((cell) => !cell);
}

/**
 * Generate a solvable puzzle by starting from all-off and applying
 * random toggles. This guarantees solvability because any sequence
 * of toggles can be reversed by replaying the same toggles.
 *
 * @param toggleCount Number of random cell toggles to apply (8-12 for level 1,
 *                    scales with level)
 */
export function generatePuzzle(toggleCount: number = 10): boolean[] {
  let grid = new Array<boolean>(TOTAL).fill(false);

  // Pick `toggleCount` distinct random cells to toggle
  const indices = Array.from({ length: TOTAL }, (_, i) => i);
  shuffle(indices);

  // Use distinct cells up to toggleCount (max 25 for a 5x5 grid)
  const picks = indices.slice(0, Math.min(toggleCount, TOTAL));

  for (const idx of picks) {
    grid = toggleCell(grid, idx);
  }

  // Edge case: if we accidentally ended up with an all-off grid, toggle one more
  if (isSolved(grid)) {
    grid = toggleCell(grid, Math.floor(Math.random() * TOTAL));
  }

  return grid;
}

/**
 * Determine toggle count for a given level (1-indexed).
 * Level 1: 8 toggles, Level 2: 9, ..., Level 5: 12
 */
export function getToggleCountForLevel(level: number): number {
  return Math.min(7 + level, TOTAL);
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
