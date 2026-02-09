// Zen Garden engine — pure functions for state management and rendering

export interface RakeLine {
  points: { x: number; y: number }[];
}

export interface Stone {
  x: number;
  y: number;
  radius: number;
  shade: number; // 0-1 for color variation
}

export interface Plant {
  x: number;
  y: number;
  growth: number; // 0 to 1
  type: "tree" | "bush" | "flower";
  placedAt: number; // timestamp for animation
}

export interface ZenGardenState {
  rakeLines: RakeLine[];
  stones: Stone[];
  plants: Plant[];
  sandCoverage: number; // 0-1 approximate coverage
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

const SAND_BG = "#d4c5a0";
const SAND_DARK = "#b8a77a";
const SAND_LINE = "#c4b48e";

export function createGardenState(): ZenGardenState {
  return {
    rakeLines: [],
    stones: [],
    plants: [],
    sandCoverage: 0,
  };
}

export function addRakePoint(
  state: ZenGardenState,
  x: number,
  y: number,
  isNewStroke: boolean
): number {
  if (isNewStroke) {
    state.rakeLines.push({ points: [{ x, y }] });
  } else {
    const lastLine = state.rakeLines[state.rakeLines.length - 1];
    if (lastLine) {
      const lastPoint = lastLine.points[lastLine.points.length - 1];
      const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);
      if (dist > 3) {
        lastLine.points.push({ x, y });
      }
    }
  }
  // Estimate coverage based on total rake points
  const totalPoints = state.rakeLines.reduce(
    (sum, line) => sum + line.points.length,
    0
  );
  state.sandCoverage = Math.min(1, totalPoints / 500);
  // Return serenity points earned (1 per new point added)
  return 1;
}

export function addStone(
  state: ZenGardenState,
  x: number,
  y: number
): void {
  const radius = 8 + Math.random() * 12;
  const shade = Math.random();
  state.stones.push({ x, y, radius, shade });
}

export function addPlant(
  state: ZenGardenState,
  x: number,
  y: number
): void {
  const types: Plant["type"][] = ["tree", "bush", "flower"];
  const type = types[Math.floor(Math.random() * types.length)];
  state.plants.push({ x, y, growth: 0, type, placedAt: Date.now() });
}

export function updatePlants(state: ZenGardenState, _deltaTime: number): void {
  const now = Date.now();
  for (const plant of state.plants) {
    const elapsed = (now - plant.placedAt) / 1000; // seconds
    // Grow over 3 seconds
    plant.growth = Math.min(1, elapsed / 3);
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: ZenGardenState,
  _time: number
): void {
  // Background - warm sand
  ctx.fillStyle = SAND_BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle sand texture
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 200; i++) {
    const tx = Math.random() * CANVAS_WIDTH;
    const ty = Math.random() * CANVAS_HEIGHT;
    ctx.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(tx, ty, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Render rake lines as parallel zen patterns
  renderRakeLines(ctx, state.rakeLines);

  // Render stones
  for (const stone of state.stones) {
    renderStone(ctx, stone);
  }

  // Render plants
  for (const plant of state.plants) {
    renderPlant(ctx, plant);
  }

  // Border
  ctx.strokeStyle = "#8a7d5a";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, CANVAS_WIDTH - 3, CANVAS_HEIGHT - 3);
}

function renderRakeLines(
  ctx: CanvasRenderingContext2D,
  rakeLines: RakeLine[]
): void {
  for (const line of rakeLines) {
    if (line.points.length < 2) continue;

    // Draw multiple parallel lines for zen rake effect
    const offsets = [-4, -2, 0, 2, 4];
    for (const offset of offsets) {
      ctx.beginPath();
      ctx.strokeStyle = SAND_DARK;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;

      for (let i = 0; i < line.points.length; i++) {
        const p = line.points[i];
        // Calculate perpendicular offset
        let nx = 0;
        let ny = 0;
        if (i < line.points.length - 1) {
          const next = line.points[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        } else if (i > 0) {
          const prev = line.points[i - 1];
          const dx = p.x - prev.x;
          const dy = p.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        }

        const ox = p.x + nx * offset;
        const oy = p.y + ny * offset;

        if (i === 0) {
          ctx.moveTo(ox, oy);
        } else {
          ctx.lineTo(ox, oy);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw a lighter line in the center groove
    ctx.beginPath();
    ctx.strokeStyle = SAND_LINE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < line.points.length; i++) {
      const p = line.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function renderStone(ctx: CanvasRenderingContext2D, stone: Stone): void {
  const { x, y, radius, shade } = stone;

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 3, radius * 0.9, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fill();

  // Stone body gradient
  const grad = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    0,
    x,
    y,
    radius
  );
  const baseGray = Math.floor(120 + shade * 60);
  grad.addColorStop(0, `rgb(${baseGray + 40}, ${baseGray + 40}, ${baseGray + 35})`);
  grad.addColorStop(0.7, `rgb(${baseGray}, ${baseGray}, ${baseGray - 5})`);
  grad.addColorStop(1, `rgb(${baseGray - 30}, ${baseGray - 30}, ${baseGray - 35})`);

  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.ellipse(
    x - radius * 0.25,
    y - radius * 0.2,
    radius * 0.3,
    radius * 0.15,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fill();
}

function renderPlant(ctx: CanvasRenderingContext2D, plant: Plant): void {
  const { x, y, growth, type } = plant;
  const g = growth; // 0 to 1

  if (type === "tree") {
    // Trunk
    const trunkHeight = 30 * g;
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(x - 2, y - trunkHeight, 4, trunkHeight);

    // Canopy (circles)
    if (g > 0.2) {
      const canopySize = 12 * g;
      const canopyY = y - trunkHeight;
      ctx.fillStyle = "#2d6b3f";
      ctx.beginPath();
      ctx.arc(x, canopyY - canopySize * 0.3, canopySize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a8a4f";
      ctx.beginPath();
      ctx.arc(
        x - canopySize * 0.5,
        canopyY + canopySize * 0.1,
        canopySize * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        x + canopySize * 0.5,
        canopyY + canopySize * 0.1,
        canopySize * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else if (type === "bush") {
    // Bush grows as expanding green circles
    const size = 10 * g;
    const colors = ["#2e7d32", "#388e3c", "#43a047"];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      const ox = (i - 1) * size * 0.6;
      const oy = -size * 0.3 * (i === 1 ? 1 : 0);
      ctx.arc(x + ox, y + oy - size * 0.5, size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "flower") {
    // Stem
    const stemHeight = 20 * g;
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - stemHeight);
    ctx.stroke();

    // Flower head
    if (g > 0.4) {
      const petalSize = 4 * g;
      const centerY = y - stemHeight;
      const petalColors = ["#e91e63", "#f06292", "#ec407a", "#f48fb1", "#e91e63"];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const px = x + Math.cos(angle) * petalSize;
        const py = centerY + Math.sin(angle) * petalSize;
        ctx.fillStyle = petalColors[i];
        ctx.beginPath();
        ctx.arc(px, py, petalSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = "#fdd835";
      ctx.beginPath();
      ctx.arc(x, centerY, petalSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
