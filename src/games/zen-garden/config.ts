import type { GameConfig } from "@/types/game";

export const zenGardenConfig: GameConfig = {
  slug: "zen-garden",
  title: "Zen Garden",
  description:
    "A peaceful sandbox. Rake sand, place stones, and grow plants in your own miniature zen garden.",
  category: "creative",
  scoreType: "custom",
  renderingMode: "canvas",
  thumbnail: "/games/zen-garden.png",
  color: "#39ff14",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5+ min",
  difficulty: "easy",
  tags: ["sandbox", "creative", "relaxing", "zen"],
  enabled: true,
};
