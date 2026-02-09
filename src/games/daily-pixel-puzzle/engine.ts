// 8x8 pixel art patterns
const T = "transparent";
const B = "#222222"; // background/empty

interface Puzzle {
  grid: string[][];
  name: string;
  options: string[];
}

const heartGrid: string[][] = [
  [B, B, B, B, B, B, B, B],
  [B, "#ff2d55", "#ff2d55", B, B, "#ff2d55", "#ff2d55", B],
  ["#ff2d55", "#ff4466", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff4466", "#ff2d55"],
  ["#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55"],
  ["#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55"],
  [B, "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", B],
  [B, B, "#ff2d55", "#ff2d55", "#ff2d55", "#ff2d55", B, B],
  [B, B, B, "#ff2d55", "#ff2d55", B, B, B],
];

const starGrid: string[][] = [
  [B, B, B, "#ffe600", "#ffe600", B, B, B],
  [B, B, "#ffe600", "#ffe600", "#ffe600", "#ffe600", B, B],
  [B, B, "#ffe600", "#fff44f", "#fff44f", "#ffe600", B, B],
  ["#ffe600", "#ffe600", "#ffe600", "#fff44f", "#fff44f", "#ffe600", "#ffe600", "#ffe600"],
  ["#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600"],
  [B, "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", B],
  [B, "#ffe600", "#ffe600", B, B, "#ffe600", "#ffe600", B],
  ["#ffe600", "#ffe600", B, B, B, B, "#ffe600", "#ffe600"],
];

const smileyGrid: string[][] = [
  [B, B, "#ffe600", "#ffe600", "#ffe600", "#ffe600", B, B],
  [B, "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", B],
  ["#ffe600", "#ffe600", "#222222", "#ffe600", "#ffe600", "#222222", "#ffe600", "#ffe600"],
  ["#ffe600", "#ffe600", "#222222", "#ffe600", "#ffe600", "#222222", "#ffe600", "#ffe600"],
  ["#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#ffe600"],
  ["#ffe600", "#cc0000", "#ffe600", "#ffe600", "#ffe600", "#ffe600", "#cc0000", "#ffe600"],
  [B, "#ffe600", "#cc0000", "#cc0000", "#cc0000", "#cc0000", "#ffe600", B],
  [B, B, "#ffe600", "#ffe600", "#ffe600", "#ffe600", B, B],
];

const houseGrid: string[][] = [
  [B, B, B, "#cc4444", "#cc4444", B, B, B],
  [B, B, "#cc4444", "#cc4444", "#cc4444", "#cc4444", B, B],
  [B, "#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444", B],
  ["#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444", "#cc4444"],
  ["#c2b280", "#c2b280", "#88ccff", "#c2b280", "#c2b280", "#88ccff", "#c2b280", "#c2b280"],
  ["#c2b280", "#c2b280", "#88ccff", "#c2b280", "#c2b280", "#88ccff", "#c2b280", "#c2b280"],
  ["#c2b280", "#c2b280", "#c2b280", "#8B4513", "#8B4513", "#c2b280", "#c2b280", "#c2b280"],
  ["#c2b280", "#c2b280", "#c2b280", "#8B4513", "#8B4513", "#c2b280", "#c2b280", "#c2b280"],
];

const treeGrid: string[][] = [
  [B, B, B, "#228B22", "#228B22", B, B, B],
  [B, B, "#228B22", "#228B22", "#228B22", "#228B22", B, B],
  [B, "#228B22", "#228B22", "#2ecc40", "#2ecc40", "#228B22", "#228B22", B],
  ["#228B22", "#228B22", "#2ecc40", "#2ecc40", "#2ecc40", "#2ecc40", "#228B22", "#228B22"],
  [B, "#228B22", "#228B22", "#2ecc40", "#2ecc40", "#228B22", "#228B22", B],
  ["#228B22", "#228B22", "#2ecc40", "#2ecc40", "#2ecc40", "#2ecc40", "#228B22", "#228B22"],
  [B, B, B, "#8B4513", "#8B4513", B, B, B],
  [B, B, B, "#8B4513", "#8B4513", B, B, B],
];

const puzzles: Puzzle[] = [
  { grid: heartGrid, name: "Heart", options: ["Heart", "Diamond", "Apple", "Balloon"] },
  { grid: starGrid, name: "Star", options: ["Moon", "Star", "Sun", "Flower"] },
  { grid: smileyGrid, name: "Smiley", options: ["Smiley", "Cookie", "Sun", "Ball"] },
  { grid: houseGrid, name: "House", options: ["Castle", "House", "Tent", "Barn"] },
  { grid: treeGrid, name: "Tree", options: ["Mushroom", "Cactus", "Broccoli", "Tree"] },
];

export function getPuzzle(index: number): Puzzle {
  return puzzles[index % puzzles.length];
}

export function getPuzzleCount(): number {
  return puzzles.length;
}
