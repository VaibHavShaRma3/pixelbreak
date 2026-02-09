import { describe, it, expect } from "vitest";
import {
  gameRegistry,
  getGameBySlug,
  getEnabledGames,
  getGamesByCategory,
} from "@/lib/game-registry";

describe("Game Registry", () => {
  it("should have 18 games total", () => {
    expect(gameRegistry.length).toBe(18);
  });

  it("should have 10 enabled games (Phase 1 + Phase 3)", () => {
    const enabled = getEnabledGames();
    expect(enabled.length).toBe(10);
    expect(enabled.map((g) => g.slug).sort()).toEqual([
      "bubble-wrap",
      "color-match",
      "constellation-hunter",
      "daily-pixel-puzzle",
      "falling-sand",
      "gacha-capsule",
      "lo-fi-typer",
      "stack",
      "sudoku-lite",
      "syntax-breaker",
    ]);
  });

  it("should find a game by slug", () => {
    const game = getGameBySlug("stack");
    expect(game).toBeDefined();
    expect(game!.title).toBe("Stack");
    expect(game!.renderingMode).toBe("canvas");
  });

  it("should return undefined for unknown slug", () => {
    expect(getGameBySlug("nonexistent")).toBeUndefined();
  });

  it("should filter games by category", () => {
    const puzzles = getGamesByCategory("puzzle");
    expect(puzzles.length).toBeGreaterThan(0);
    puzzles.forEach((g) => expect(g.category).toBe("puzzle"));
  });

  it("every game should have required fields", () => {
    gameRegistry.forEach((game) => {
      expect(game.slug).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(["arcade", "puzzle", "creative", "chill"]).toContain(game.category);
      expect(["points", "time", "accuracy", "combo", "custom"]).toContain(
        game.scoreType
      );
      expect(["dom", "canvas", "phaser"]).toContain(game.renderingMode);
    });
  });

  it("all slugs should be unique", () => {
    const slugs = gameRegistry.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
