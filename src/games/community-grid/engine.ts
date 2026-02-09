// Community Grid engine — 32x32 pixel art canvas

const GRID_SIZE = 32;
const CELL_SIZE = 15;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 480

const EMPTY_COLOR = "#0a0a14";

export function getCanvasSize() {
  return CANVAS_SIZE;
}

export function getGridSize() {
  return GRID_SIZE;
}

export function getCellSize() {
  return CELL_SIZE;
}

export type Grid = (string | null)[][];

export function createGrid(): Grid {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = null;
    }
  }
  return grid;
}

export function clearGrid(grid: Grid): void {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = null;
    }
  }
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

export function placePixel(grid: Grid, x: number, y: number, color: string): number {
  if (!inBounds(x, y)) return 0;
  if (grid[y][x] === color) return 0;
  grid[y][x] = color;
  return 1;
}

export function erasePixel(grid: Grid, x: number, y: number): void {
  if (!inBounds(x, y)) return;
  grid[y][x] = null;
}

export function floodFill(grid: Grid, startX: number, startY: number, color: string): number {
  if (!inBounds(startX, startY)) return 0;

  const targetColor = grid[startY][startX];
  if (targetColor === color) return 0; // Already the same color

  let filled = 0;
  const stack: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    if (!inBounds(x, y)) continue;
    if (grid[y][x] !== targetColor) continue;

    visited.add(key);
    grid[y][x] = color;
    filled++;

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

  return filled;
}

export function pixelToGrid(
  canvasX: number,
  canvasY: number,
  canvasDisplayWidth: number
): { x: number; y: number } | null {
  const scale = CANVAS_SIZE / canvasDisplayWidth;
  const x = Math.floor((canvasX * scale) / CELL_SIZE);
  const y = Math.floor((canvasY * scale) / CELL_SIZE);
  if (!inBounds(x, y)) return null;
  return { x, y };
}

export function render(ctx: CanvasRenderingContext2D, grid: Grid): void {
  // Background
  ctx.fillStyle = EMPTY_COLOR;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Cells
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const color = grid[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= GRID_SIZE; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, CANVAS_SIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= GRID_SIZE; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(CANVAS_SIZE, y * CELL_SIZE);
    ctx.stroke();
  }
}

export function renderHover(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  hoverX: number,
  hoverY: number,
  color: string,
  tool: string
): void {
  // Render normal grid first
  render(ctx, grid);

  // Highlight hovered cell
  if (inBounds(hoverX, hoverY)) {
    if (tool === "eraser") {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoverX * CELL_SIZE + 1,
        hoverY * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      // X mark
      ctx.beginPath();
      ctx.moveTo(hoverX * CELL_SIZE + 3, hoverY * CELL_SIZE + 3);
      ctx.lineTo((hoverX + 1) * CELL_SIZE - 3, (hoverY + 1) * CELL_SIZE - 3);
      ctx.moveTo((hoverX + 1) * CELL_SIZE - 3, hoverY * CELL_SIZE + 3);
      ctx.lineTo(hoverX * CELL_SIZE + 3, (hoverY + 1) * CELL_SIZE - 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(
        hoverX * CELL_SIZE,
        hoverY * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        hoverX * CELL_SIZE + 0.5,
        hoverY * CELL_SIZE + 0.5,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    }
  }
}
