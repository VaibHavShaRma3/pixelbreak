import type { GameConfig } from "@/types/game";

export const colorMatchConfig: GameConfig = {
  slug: "color-match",
  title: "Color Match",
  description: "Match the color name to the correct color swatch. Speed and accuracy matter!",
  category: "puzzle",
  scoreType: "accuracy",
  renderingMode: "dom",
  thumbnail: "/games/color-match.png",
  color: "#ff2d95",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "2-5 min",
  difficulty: "medium",
  tags: ["brain", "speed", "colors"],
  enabled: true,
};
