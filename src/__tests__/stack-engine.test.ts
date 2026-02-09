import { describe, it, expect } from "vitest";
import {
  createInitialState,
  updateMovingBlock,
  dropBlock,
} from "@/games/stack/engine";

describe("Stack Engine", () => {
  it("should create initial state with one block and a moving block", () => {
    const state = createInitialState();
    expect(state.blocks.length).toBe(1);
    expect(state.currentBlock).not.toBeNull();
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it("should move the current block horizontally", () => {
    const state = createInitialState();
    const next = updateMovingBlock(state);
    expect(next.currentBlock!.x).not.toBe(state.currentBlock!.x);
  });

  it("should place block on drop with overlap", () => {
    const state = createInitialState();
    // Position current block to overlap with base
    state.currentBlock!.x = state.blocks[0].x;
    const next = dropBlock(state);
    expect(next.blocks.length).toBe(2);
    expect(next.score).toBe(1);
    expect(next.gameOver).toBe(false);
  });

  it("should end game when block misses completely", () => {
    const state = createInitialState();
    // Position current block way off to the right
    state.currentBlock!.x = 399;
    state.currentBlock!.width = 1;
    // Ensure base block is at far left
    state.blocks[0].x = 0;
    state.blocks[0].width = 50;
    const next = dropBlock(state);
    expect(next.gameOver).toBe(true);
  });

  it("should increase speed after each drop", () => {
    let state = createInitialState();
    state.currentBlock!.x = state.blocks[0].x;
    const initialSpeed = state.speed;
    state = dropBlock(state);
    expect(state.speed).toBeGreaterThan(initialSpeed);
  });
});
