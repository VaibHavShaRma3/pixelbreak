// Focus Forest engine — pure functions for rendering the growing tree scene

export interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 400;

export function createSparkles(count: number, treeX: number, treeY: number): Sparkle[] {
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    sparkles.push({
      x: treeX + (Math.random() - 0.5) * 120,
      y: treeY - Math.random() * 200,
      size: 1 + Math.random() * 2,
      opacity: Math.random(),
      speed: 0.3 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
    });
  }
  return sparkles;
}

export function updateSparkles(sparkles: Sparkle[], deltaTime: number): void {
  for (const s of sparkles) {
    s.angle += deltaTime * s.speed * 2;
    s.y -= deltaTime * 10;
    s.opacity = 0.3 + Math.sin(s.angle) * 0.4;
    // Reset if too high
    if (s.y < GROUND_Y - 250) {
      s.y = GROUND_Y - Math.random() * 50;
      s.x = 200 + (Math.random() - 0.5) * 120;
    }
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  growth: number, // 0-1
  elapsedSeconds: number,
  sparkles: Sparkle[],
  previousTrees: number[],
  time: number
): void {
  // Sky — dark blue gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, "#0a0e27");
  skyGrad.addColorStop(0.5, "#141b3d");
  skyGrad.addColorStop(1, "#1a2740");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

  // Stars
  const starSeed = 42;
  for (let i = 0; i < 50; i++) {
    const sx = ((starSeed * (i + 1) * 7) % CANVAS_WIDTH);
    const sy = ((starSeed * (i + 1) * 13) % (GROUND_Y - 50));
    const twinkle = 0.3 + Math.sin(time / 1000 + i) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Ground
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, "#1a4a1a");
  groundGrad.addColorStop(0.3, "#0f3a0f");
  groundGrad.addColorStop(1, "#0a2a0a");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // Ground highlight line
  ctx.strokeStyle = "#2a6a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();

  // Previous trees (smaller, in background)
  const maxBgTrees = Math.min(previousTrees.length, 6);
  for (let i = 0; i < maxBgTrees; i++) {
    const bgGrowth = Math.min(1, previousTrees[i] / 1500);
    const bgX = 40 + i * 55;
    const bgScale = 0.3;
    renderTree(ctx, bgX, GROUND_Y, bgGrowth, bgScale, 0.4);
  }

  // Main tree
  renderTree(ctx, 200, GROUND_Y, growth, 1, 1);

  // Sparkles around growing tree
  if (growth > 0.05) {
    for (const s of sparkles) {
      ctx.fillStyle = `rgba(57, 255, 20, ${s.opacity * growth})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Timer display
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(timeStr, 200, 50);

  // Stage label
  const stageNames = ["Seed", "Sprout", "Sapling", "Young Tree", "Full Tree"];
  const stageIdx = Math.min(4, Math.floor(elapsedSeconds / 300));
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "rgba(57, 255, 20, 0.7)";
  ctx.fillText(stageNames[stageIdx], 200, 75);
}

function renderTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  growth: number, // 0-1
  scale: number,
  opacity: number
): void {
  ctx.save();
  ctx.globalAlpha = opacity;

  if (growth < 0.05) {
    // Seed — small brown dot
    ctx.fillStyle = "#5a3a1a";
    ctx.beginPath();
    ctx.ellipse(x, groundY - 3 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (growth < 0.2) {
    // Sprout — small stem with tiny leaves
    const height = 20 * growth * 5 * scale; // 0-20
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY - height);
    ctx.stroke();

    // Tiny leaves
    ctx.fillStyle = "#66bb6a";
    ctx.beginPath();
    ctx.ellipse(x - 4 * scale, groundY - height + 2, 4 * scale, 2 * scale, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 4 * scale, groundY - height + 2, 4 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Sapling -> Young -> Full: trunk + canopy
    const trunkHeight = (40 + growth * 80) * scale;
    const trunkWidth = (3 + growth * 5) * scale;
    const canopyRadius = (15 + growth * 35) * scale;

    // Trunk
    ctx.fillStyle = "#5d4037";
    ctx.beginPath();
    ctx.moveTo(x - trunkWidth, groundY);
    ctx.lineTo(x - trunkWidth * 0.6, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth * 0.6, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth, groundY);
    ctx.closePath();
    ctx.fill();

    // Branches (for young and full)
    if (growth > 0.5) {
      const branchLen = canopyRadius * 0.6;
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 2 * scale;

      // Left branch
      ctx.beginPath();
      ctx.moveTo(x, groundY - trunkHeight * 0.7);
      ctx.lineTo(x - branchLen, groundY - trunkHeight * 0.85);
      ctx.stroke();

      // Right branch
      ctx.beginPath();
      ctx.moveTo(x, groundY - trunkHeight * 0.6);
      ctx.lineTo(x + branchLen * 0.8, groundY - trunkHeight * 0.75);
      ctx.stroke();
    }

    // Canopy
    const canopyY = groundY - trunkHeight;
    const colors = ["#2e7d32", "#388e3c", "#43a047", "#4caf50"];

    // Multiple circles for bushy canopy
    const circles = [
      { ox: 0, oy: -canopyRadius * 0.3, r: canopyRadius * 0.9 },
      { ox: -canopyRadius * 0.5, oy: canopyRadius * 0.1, r: canopyRadius * 0.7 },
      { ox: canopyRadius * 0.5, oy: canopyRadius * 0.1, r: canopyRadius * 0.7 },
      { ox: -canopyRadius * 0.25, oy: -canopyRadius * 0.6, r: canopyRadius * 0.5 },
      { ox: canopyRadius * 0.25, oy: -canopyRadius * 0.6, r: canopyRadius * 0.5 },
    ];

    for (let i = 0; i < circles.length; i++) {
      const c = circles[i];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x + c.ox, canopyY + c.oy, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Canopy highlight
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(x, canopyY - canopyRadius * 0.3, canopyRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
