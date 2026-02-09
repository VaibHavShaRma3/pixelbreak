import type { GameConfig } from "@/types/game";

export const fallingSandConfig: GameConfig = {
  slug: "falling-sand",
  title: "Falling Sand",
  description: "A digital sandbox. Drop sand, water, and fire particles and watch them interact.",
  category: "creative",
  scoreType: "custom",
  renderingMode: "canvas",
  thumbnail: "/games/falling-sand.png",
  color: "#ffe600",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5+ min",
  difficulty: "easy",
  tags: ["sandbox", "physics", "creative"],
  enabled: true,
};
