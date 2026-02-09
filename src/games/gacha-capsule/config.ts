import type { GameConfig } from "@/types/game";

export const gachaCapsuleConfig: GameConfig = {
  slug: "gacha-capsule",
  title: "Gacha Capsule",
  description: "Spend virtual coins on capsule machines. Collect rare items and complete sets!",
  category: "chill",
  scoreType: "custom",
  renderingMode: "dom",
  thumbnail: "/games/gacha-capsule.png",
  color: "#ff2d95",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5+ min",
  difficulty: "easy",
  tags: ["collecting", "luck", "gacha"],
  enabled: true,
};
