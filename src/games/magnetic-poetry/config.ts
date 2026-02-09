import type { GameConfig } from "@/types/game";

export const magneticPoetryConfig: GameConfig = {
  slug: "magnetic-poetry",
  title: "Magnetic Poetry",
  description:
    "Drag word magnets on a fridge to create poems. Express yourself with words.",
  category: "creative",
  scoreType: "custom",
  renderingMode: "dom",
  thumbnail: "/games/magnetic-poetry.png",
  color: "#b026ff",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5+ min",
  difficulty: "easy",
  tags: ["creative", "words", "poetry", "relaxing"],
  enabled: true,
};
