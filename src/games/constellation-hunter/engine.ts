export interface Star {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

export interface Constellation {
  name: string;
  stars: Star[];
  connections: [number, number][]; // pairs of star indices
}

const constellations: Constellation[] = [
  {
    name: "Big Dipper",
    stars: [
      { x: 0.2, y: 0.3 },
      { x: 0.3, y: 0.25 },
      { x: 0.4, y: 0.28 },
      { x: 0.5, y: 0.35 },
      { x: 0.55, y: 0.5 },
      { x: 0.65, y: 0.55 },
      { x: 0.65, y: 0.4 },
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3],
    ],
  },
  {
    name: "Orion",
    stars: [
      { x: 0.4, y: 0.15 },  // head
      { x: 0.3, y: 0.3 },   // left shoulder
      { x: 0.5, y: 0.3 },   // right shoulder
      { x: 0.35, y: 0.45 }, // belt left
      { x: 0.42, y: 0.45 }, // belt middle
      { x: 0.49, y: 0.45 }, // belt right
      { x: 0.28, y: 0.7 },  // left foot
    ],
    connections: [
      [0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6],
    ],
  },
  {
    name: "Triangle",
    stars: [
      { x: 0.5, y: 0.2 },
      { x: 0.3, y: 0.7 },
      { x: 0.7, y: 0.7 },
    ],
    connections: [
      [0, 1], [1, 2], [2, 0],
    ],
  },
  {
    name: "Diamond",
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.3, y: 0.45 },
      { x: 0.7, y: 0.45 },
      { x: 0.5, y: 0.75 },
    ],
    connections: [
      [0, 1], [0, 2], [1, 3], [2, 3],
    ],
  },
  {
    name: "Cross",
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.4 },
      { x: 0.3, y: 0.4 },
      { x: 0.7, y: 0.4 },
      { x: 0.5, y: 0.7 },
    ],
    connections: [
      [0, 1], [1, 4], [2, 1], [1, 3],
    ],
  },
];

export function getConstellation(level: number): Constellation {
  return constellations[level % constellations.length];
}

export function getConstellationCount(): number {
  return constellations.length;
}

// Generate static background stars
export function generateBackgroundStars(count: number): { x: number; y: number; size: number }[] {
  const stars: { x: number; y: number; size: number }[] = [];
  // Use seeded-like approach for consistent stars
  for (let i = 0; i < count; i++) {
    stars.push({
      x: ((i * 7919 + 104729) % 10000) / 10000,
      y: ((i * 6271 + 88651) % 10000) / 10000,
      size: 0.5 + ((i * 3571) % 100) / 100,
    });
  }
  return stars;
}

function pairKey(a: number, b: number): string {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return `${min},${max}`;
}

export function checkConnection(
  star1Index: number,
  star2Index: number,
  constellation: Constellation
): boolean {
  const key = pairKey(star1Index, star2Index);
  return constellation.connections.some(([a, b]) => pairKey(a, b) === key);
}

export function connectionToKey(a: number, b: number): string {
  return pairKey(a, b);
}

export function renderStars(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  constellation: Constellation,
  connectedPairs: Set<string>,
  backgroundStars: { x: number; y: number; size: number }[],
  currentLine: { fromIndex: number; toX: number; toY: number } | null,
  pulsePhase: number
) {
  // Dark blue background
  ctx.fillStyle = "#0a0a2e";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Background stars
  ctx.fillStyle = "#ffffff";
  for (const star of backgroundStars) {
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(pulsePhase * 0.5 + star.x * 100));
    ctx.globalAlpha = twinkle * 0.6;
    ctx.beginPath();
    ctx.arc(star.x * canvasWidth, star.y * canvasHeight, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw completed connections
  ctx.strokeStyle = "#b026ff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#b026ff";
  ctx.shadowBlur = 8;
  for (const pairStr of connectedPairs) {
    const [aStr, bStr] = pairStr.split(",");
    const a = parseInt(aStr);
    const b = parseInt(bStr);
    const starA = constellation.stars[a];
    const starB = constellation.stars[b];
    ctx.beginPath();
    ctx.moveTo(starA.x * canvasWidth, starA.y * canvasHeight);
    ctx.lineTo(starB.x * canvasWidth, starB.y * canvasHeight);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Draw current drag line
  if (currentLine) {
    const fromStar = constellation.stars[currentLine.fromIndex];
    ctx.strokeStyle = "rgba(176, 38, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(fromStar.x * canvasWidth, fromStar.y * canvasHeight);
    ctx.lineTo(currentLine.toX, currentLine.toY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw constellation stars with pulsing glow
  for (let i = 0; i < constellation.stars.length; i++) {
    const star = constellation.stars[i];
    const sx = star.x * canvasWidth;
    const sy = star.y * canvasHeight;
    const pulse = 1 + 0.3 * Math.sin(pulsePhase * 2 + i);
    const baseRadius = 8;

    // Outer glow
    const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, baseRadius * pulse * 2);
    gradient.addColorStop(0, "rgba(176, 38, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(176, 38, 255, 0.3)");
    gradient.addColorStop(1, "rgba(176, 38, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, baseRadius * pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner star
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sx, sy, baseRadius * pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
