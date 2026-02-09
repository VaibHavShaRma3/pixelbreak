import type { GameConfig } from "@/types/game";

export const workspacePetConfig: GameConfig = {
  slug: "workspace-pet",
  title: "Workspace Pet",
  description: "Adopt a virtual pet that lives on your screen. Feed, play, and keep it happy!",
  category: "chill",
  scoreType: "custom",
  renderingMode: "dom",
  thumbnail: "/games/workspace-pet.png",
  color: "#ff2d95",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "ongoing",
  difficulty: "easy",
  tags: ["pet", "tamagotchi", "cute"],
  enabled: true,
};
