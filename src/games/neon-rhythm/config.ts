import type { GameConfig } from "@/types/game";

export const neonRhythmConfig: GameConfig = {
  slug: "neon-rhythm",
  title: "Neon Rhythm",
  description: "Hit notes to the beat in this neon-styled rhythm game.",
  category: "arcade",
  scoreType: "combo",
  renderingMode: "dom",
  thumbnail: "/games/neon-rhythm.png",
  color: "#ff2d95",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-5 min",
  difficulty: "hard",
  tags: ["rhythm", "music", "arcade"],
  enabled: true,
};
