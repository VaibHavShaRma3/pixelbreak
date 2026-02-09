import { describe, it, expect } from "vitest";
import { generatePuzzle, checkSolution, getConflicts } from "@/games/sudoku-lite/engine";

describe("Sudoku Lite Engine", () => {
  it("should generate a valid solution", () => {
    const { solution } = generatePuzzle(8);
    expect(solution.length).toBe(16);
    // All values should be 1-4
    solution.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(4);
    });
    // Solution should pass validation
    expect(checkSolution(solution)).toBe(true);
  });

  it("should generate a puzzle with correct number of blanks", () => {
    const { puzzle } = generatePuzzle(8);
    const blanks = puzzle.filter((v) => v === null).length;
    expect(blanks).toBe(8);
  });

  it("should detect incomplete grid", () => {
    const { puzzle } = generatePuzzle(8);
    expect(checkSolution(puzzle)).toBe(false);
  });

  it("should detect conflicts", () => {
    // Create a grid with a known conflict: two 1s in the same row
    const grid: (number | null)[] = [
      1, 1, 3, 4,
      3, 4, 1, 2,
      2, 3, 4, 1,
      4, 1, 2, 3,
    ];
    const conflicts = getConflicts(grid, 0, 1);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts).toContain(1); // position 1 also has value 1
  });

  it("should find no conflicts in a valid grid", () => {
    const { solution } = generatePuzzle(0);
    solution.forEach((value, pos) => {
      const conflicts = getConflicts(solution, pos, value);
      expect(conflicts.length).toBe(0);
    });
  });
});
