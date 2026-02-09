import type { GameConfig } from "@/types/game";

export const bubbleWrapConfig: GameConfig = {
  slug: "bubble-wrap",
  title: "Infinite Bubble Wrap",
  description: "Pop as many bubbles as you can! Each pop earns a point. Simple, satisfying, infinite.",
  category: "chill",
  scoreType: "points",
  renderingMode: "dom",
  thumbnail: "/games/bubble-wrap.png",
  color: "#00fff5",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "1-3 min",
  difficulty: "easy",
  tags: ["relaxing", "clicker", "satisfying"],
  enabled: true,
};
