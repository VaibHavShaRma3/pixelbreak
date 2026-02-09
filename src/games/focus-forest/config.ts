import type { GameConfig } from "@/types/game";

export const focusForestConfig: GameConfig = {
  slug: "focus-forest",
  title: "Focus Forest",
  description:
    "A productivity timer. Start a focus session and watch your tree grow. Stay focused to keep it alive.",
  category: "chill",
  scoreType: "time",
  renderingMode: "canvas",
  thumbnail: "/games/focus-forest.png",
  color: "#39ff14",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "5-25 min",
  difficulty: "easy",
  tags: ["productivity", "timer", "relaxing", "focus"],
  enabled: true,
};
