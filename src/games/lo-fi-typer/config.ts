import type { GameConfig } from "@/types/game";

export const loFiTyperConfig: GameConfig = {
  slug: "lo-fi-typer",
  title: "Lo-Fi Typer",
  description: "Type along to lo-fi beats. Accuracy and speed combine for your score.",
  category: "chill",
  scoreType: "combo",
  renderingMode: "dom",
  thumbnail: "/games/lo-fi-typer.png",
  color: "#00fff5",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "2-5 min",
  difficulty: "medium",
  tags: ["typing", "music", "chill"],
  enabled: true,
};
