import type { GameConfig } from "@/types/game";

export const constellationHunterConfig: GameConfig = {
  slug: "constellation-hunter",
  title: "Constellation Hunter",
  description: "Connect stars to form constellations against a ticking clock.",
  category: "puzzle",
  scoreType: "points",
  renderingMode: "canvas",
  thumbnail: "/games/constellation-hunter.png",
  color: "#b026ff",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-5 min",
  difficulty: "medium",
  tags: ["stars", "patterns", "spatial"],
  enabled: true,
};
