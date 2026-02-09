import type { GameConfig } from "@/types/game";

export const oneMinuteBaristaConfig: GameConfig = {
  slug: "one-minute-barista",
  title: "1-Minute Barista",
  description: "Make coffee orders as fast as possible in 60 seconds. Don't mess up the orders!",
  category: "arcade",
  scoreType: "points",
  renderingMode: "dom",
  thumbnail: "/games/one-minute-barista.png",
  color: "#ffe600",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "1 min",
  difficulty: "hard",
  tags: ["speed", "memory", "arcade"],
  enabled: true,
};
