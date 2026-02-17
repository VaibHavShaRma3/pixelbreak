// Memory Matrix — Pure game logic (no state, no React)

export interface LevelConfig {
  gridSize: number;
  highlightCount: number;
  showTimeMs: number;
}

/**
 * Returns the configuration for a given level.
 *
 * Level 1: 3x3, 3 cells, 2000ms
 * Level 2: 3x3, 4 cells, 1800ms
 * Level 3: 4x4, 5 cells, 1600ms
 * Level 4: 4x4, 6 cells, 1400ms
 * Level 5: 5x5, 7 cells, 1200ms
 * Level 6+: 5x5, 7 + (level - 5) cells, 1000ms
 */
export function getLevelConfig(level: number): LevelConfig {
  switch (level) {
    case 1:
      return { gridSize: 3, highlightCount: 3, showTimeMs: 2000 };
    case 2:
      return { gridSize: 3, highlightCount: 4, showTimeMs: 1800 };
    case 3:
      return { gridSize: 4, highlightCount: 5, showTimeMs: 1600 };
    case 4:
      return { gridSize: 4, highlightCount: 6, showTimeMs: 1400 };
    case 5:
      return { gridSize: 5, highlightCount: 7, showTimeMs: 1200 };
    default: {
      // Level 6+: 5x5 grid, increasing cell count, fixed 1000ms
      const highlightCount = 7 + (level - 5);
      // Cap at total cells minus 1 so it's always solvable
      const maxCells = 5 * 5;
      return {
        gridSize: 5,
        highlightCount: Math.min(highlightCount, maxCells - 1),
        showTimeMs: 1000,
      };
    }
  }
}

/**
 * Generates a Set of `count` random unique cell indices within a grid of
 * `gridSize * gridSize` total cells.
 */
export function generatePattern(gridSize: number, count: number): Set<number> {
  const totalCells = gridSize * gridSize;
  const indices: number[] = [];

  for (let i = 0; i < totalCells; i++) {
    indices.push(i);
  }

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return new Set(indices.slice(0, count));
}

/**
 * Returns true if the player's selected cells match the pattern exactly.
 * Both must contain the same indices and the same count.
 */
export function checkAnswer(pattern: Set<number>, selected: Set<number>): boolean {
  if (pattern.size !== selected.size) return false;

  for (const idx of pattern) {
    if (!selected.has(idx)) return false;
  }

  return true;
}
