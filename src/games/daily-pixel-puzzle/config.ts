import type { GameConfig } from "@/types/game";

export const dailyPixelPuzzleConfig: GameConfig = {
  slug: "daily-pixel-puzzle",
  title: "Daily Pixel Puzzle",
  description: "Reveal a pixel art image one tile at a time. Guess the image to earn bonus points.",
  category: "puzzle",
  scoreType: "points",
  renderingMode: "dom",
  thumbnail: "/games/daily-pixel-puzzle.png",
  color: "#ffe600",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-5 min",
  difficulty: "easy",
  tags: ["daily", "pixel-art", "guessing"],
  enabled: true,
};
