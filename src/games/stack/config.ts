import type { GameConfig } from "@/types/game";

export const stackConfig: GameConfig = {
  slug: "stack",
  title: "Stack",
  description: "Stack blocks as high as you can. Time your drops perfectly — each miss shrinks the platform.",
  category: "arcade",
  scoreType: "points",
  renderingMode: "canvas",
  thumbnail: "/games/stack.png",
  color: "#39ff14",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "2-5 min",
  difficulty: "medium",
  tags: ["timing", "precision", "arcade"],
  enabled: true,
};
