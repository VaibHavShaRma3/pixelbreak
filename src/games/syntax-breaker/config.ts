import type { GameConfig } from "@/types/game";

export const syntaxBreakerConfig: GameConfig = {
  slug: "syntax-breaker",
  title: "Syntax Breaker",
  description: "Find and fix the syntax errors in code snippets before time runs out.",
  category: "puzzle",
  scoreType: "points",
  renderingMode: "dom",
  thumbnail: "/games/syntax-breaker.png",
  color: "#39ff14",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-5 min",
  difficulty: "hard",
  tags: ["coding", "debugging", "speed"],
  enabled: true,
};
