import type { GameConfig } from "@/types/game";

export const hexagonLandConfig: GameConfig = {
  slug: "hexagon-land",
  title: "Hexagon Land",
  description: "Place hexagonal tiles to build a landscape. Match biomes for bonus points.",
  category: "puzzle",
  scoreType: "points",
  renderingMode: "dom",
  thumbnail: "/games/hexagon-land.png",
  color: "#00fff5",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5-10 min",
  difficulty: "medium",
  tags: ["strategy", "tiles", "building"],
  enabled: true,
};
