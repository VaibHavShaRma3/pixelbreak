import type { GameConfig } from "@/types/game";

export const communityGridConfig: GameConfig = {
  slug: "community-grid",
  title: "Community Grid",
  description:
    "A shared pixel art canvas. Place colored pixels on a 32x32 grid to create art.",
  category: "creative",
  scoreType: "custom",
  renderingMode: "canvas",
  thumbnail: "/games/community-grid.png",
  color: "#00fff5",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5+ min",
  difficulty: "easy",
  tags: ["pixel-art", "creative", "sandbox", "art"],
  enabled: true,
};
