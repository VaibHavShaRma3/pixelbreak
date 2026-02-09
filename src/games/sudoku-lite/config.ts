import type { GameConfig } from "@/types/game";

export const sudokuLiteConfig: GameConfig = {
  slug: "sudoku-lite",
  title: "Sudoku Lite",
  description: "A simplified 4x4 Sudoku. Fill the grid so each row, column, and box has 1-4. Race the clock!",
  category: "puzzle",
  scoreType: "time",
  renderingMode: "dom",
  thumbnail: "/games/sudoku-lite.png",
  color: "#b026ff",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-10 min",
  difficulty: "medium",
  tags: ["logic", "numbers", "puzzle"],
  enabled: true,
};
