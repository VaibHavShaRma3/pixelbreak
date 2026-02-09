import { create } from "zustand";

export type Biome = "forest" | "water" | "mountain" | "desert" | "city" | "farm";

export interface HexCell {
  q: number;
  r: number;
  biome: Biome | null;
}

interface HexagonLandState {
  grid: HexCell[];
  currentTile: Biome;
  queue: Biome[];
  tilesRemaining: number;
  score: number;
  placeTile: (q: number, r: number) => number; // returns points earned
  reset: () => void;
}

const ALL_BIOMES: Biome[] = ["forest", "water", "mountain", "desert", "city", "farm"];

function randomBiome(): Biome {
  return ALL_BIOMES[Math.floor(Math.random() * ALL_BIOMES.length)];
}

function generateQueue(count: number): Biome[] {
  return Array.from({ length: count }, () => randomBiome());
}

// Generate hex grid: offset coordinates for a hex shape ~37 cells
function generateHexGrid(): HexCell[] {
  const cells: HexCell[] = [];
  const size = 3; // radius 3 gives ~37 cells in a hex shape

  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size);
    const r2 = Math.min(size, -q + size);
    for (let r = r1; r <= r2; r++) {
      cells.push({ q, r, biome: null });
    }
  }
  return cells;
}

// Get axial neighbors for a hex cell
function getNeighbors(q: number, r: number): [number, number][] {
  return [
    [q + 1, r],
    [q - 1, r],
    [q, r + 1],
    [q, r - 1],
    [q + 1, r - 1],
    [q - 1, r + 1],
  ];
}

export const useHexagonLandStore = create<HexagonLandState>((set, get) => {
  const initialQueue = generateQueue(3);
  return {
    grid: generateHexGrid(),
    currentTile: randomBiome(),
    queue: initialQueue,
    tilesRemaining: 20,
    score: 0,

    placeTile: (q: number, r: number) => {
      const state = get();
      const cellIndex = state.grid.findIndex((c) => c.q === q && c.r === r);
      if (cellIndex === -1) return 0;
      if (state.grid[cellIndex].biome !== null) return 0;
      if (state.tilesRemaining <= 0) return 0;

      const biome = state.currentTile;
      const newGrid = [...state.grid];
      newGrid[cellIndex] = { ...newGrid[cellIndex], biome };

      // Calculate bonus for adjacent matching biomes
      const neighbors = getNeighbors(q, r);
      let matchBonus = 0;
      for (const [nq, nr] of neighbors) {
        const neighbor = newGrid.find((c) => c.q === nq && c.r === nr);
        if (neighbor && neighbor.biome === biome) {
          matchBonus += 3;
        }
      }

      const points = 1 + matchBonus;
      const newQueue = [...state.queue];
      const nextTile = newQueue.shift()!;
      newQueue.push(randomBiome());

      set({
        grid: newGrid,
        currentTile: nextTile,
        queue: newQueue,
        tilesRemaining: state.tilesRemaining - 1,
        score: state.score + points,
      });

      return points;
    },

    reset: () => {
      const newQueue = generateQueue(3);
      set({
        grid: generateHexGrid(),
        currentTile: randomBiome(),
        queue: newQueue,
        tilesRemaining: 20,
        score: 0,
      });
    },
  };
});
