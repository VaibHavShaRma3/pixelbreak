export type ParticleType = "sand" | "water" | "fire" | "wall" | "empty";

export interface Particle {
  type: ParticleType;
  life: number; // for fire particles
}

const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const CELL_SIZE = 4;

export function createGrid(): Particle[][] {
  const grid: Particle[][] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[y][x] = { type: "empty", life: 0 };
    }
  }
  return grid;
}

export function getGridDimensions() {
  return { width: GRID_WIDTH, height: GRID_HEIGHT, cellSize: CELL_SIZE };
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

function isEmpty(grid: Particle[][], x: number, y: number): boolean {
  return inBounds(x, y) && grid[y][x].type === "empty";
}

function isLiquidOrEmpty(grid: Particle[][], x: number, y: number): boolean {
  return inBounds(x, y) && (grid[y][x].type === "empty" || grid[y][x].type === "water");
}

export function updateGrid(grid: Particle[][]): Particle[][] {
  // Process bottom to top so particles fall correctly
  for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    // Alternate left-right scan direction for more natural behavior
    const leftToRight = Math.random() > 0.5;
    for (let i = 0; i < GRID_WIDTH; i++) {
      const x = leftToRight ? i : GRID_WIDTH - 1 - i;
      const particle = grid[y][x];

      if (particle.type === "empty" || particle.type === "wall") continue;

      if (particle.type === "sand") {
        if (isEmpty(grid, x, y + 1)) {
          grid[y + 1][x] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x - 1, y + 1)) {
          grid[y + 1][x - 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x + 1, y + 1)) {
          grid[y + 1][x + 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        }
        // Sand sinks through water
        else if (inBounds(x, y + 1) && grid[y + 1][x].type === "water") {
          const temp = grid[y + 1][x];
          grid[y + 1][x] = particle;
          grid[y][x] = temp;
        }
      } else if (particle.type === "water") {
        if (isEmpty(grid, x, y + 1)) {
          grid[y + 1][x] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x - 1, y + 1)) {
          grid[y + 1][x - 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x + 1, y + 1)) {
          grid[y + 1][x + 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x - 1, y)) {
          grid[y][x - 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x + 1, y)) {
          grid[y][x + 1] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        }
      } else if (particle.type === "fire") {
        particle.life -= 1;
        if (particle.life <= 0) {
          grid[y][x] = { type: "empty", life: 0 };
          continue;
        }
        // Fire rises
        const drift = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        const newX = x + drift;
        const newY = y - 1;
        if (isEmpty(grid, newX, newY)) {
          grid[newY][newX] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        } else if (isEmpty(grid, x, newY)) {
          grid[newY][x] = particle;
          grid[y][x] = { type: "empty", life: 0 };
        }
        // Fire evaporates water
        const neighbors = [
          [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (inBounds(nx, ny) && grid[ny][nx].type === "water") {
            grid[ny][nx] = { type: "empty", life: 0 };
            particle.life -= 5;
            break;
          }
        }
      }
    }
  }
  return grid;
}

function getParticleColor(particle: Particle): string {
  switch (particle.type) {
    case "sand": {
      // Slight color variation
      const variation = Math.random() * 20 - 10;
      const r = 194 + variation;
      const g = 178 + variation;
      const b = 128 + variation;
      return `rgb(${r},${g},${b})`;
    }
    case "water":
      return `rgba(68, 68, 255, ${0.7 + Math.random() * 0.3})`;
    case "fire": {
      const lifeRatio = particle.life / 30;
      if (lifeRatio > 0.6) return "#ff4400";
      if (lifeRatio > 0.3) return "#ff8800";
      return "#ffcc00";
    }
    case "wall":
      return "#888888";
    default:
      return "transparent";
  }
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  grid: Particle[][],
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const particle = grid[y][x];
      if (particle.type === "empty") continue;
      ctx.fillStyle = getParticleColor(particle);
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

export function placeParticle(
  grid: Particle[][],
  x: number,
  y: number,
  type: ParticleType,
  brushSize: number
): number {
  let placed = 0;
  const half = Math.floor(brushSize / 2);
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!inBounds(px, py)) continue;
      if (type === "empty") {
        // Eraser
        if (grid[py][px].type !== "empty") {
          grid[py][px] = { type: "empty", life: 0 };
        }
      } else {
        if (grid[py][px].type === "empty") {
          grid[py][px] = {
            type,
            life: type === "fire" ? 25 + Math.random() * 10 : 0,
          };
          placed++;
        }
      }
    }
  }
  return placed;
}
