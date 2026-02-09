export interface AchievementDef {
  slug: string;
  title: string;
  description: string;
  icon: string; // emoji
  gameSlug: string | null; // null = global
  criteria: { type: string; value: number };
}

export const achievementDefs: AchievementDef[] = [
  // Global
  { slug: "first-game", title: "First Steps", description: "Play your first game", icon: "🎮", gameSlug: null, criteria: { type: "total_plays", value: 1 } },
  { slug: "ten-games", title: "Dedicated Gamer", description: "Play 10 games", icon: "🏆", gameSlug: null, criteria: { type: "total_plays", value: 10 } },
  { slug: "fifty-games", title: "Game Addict", description: "Play 50 games", icon: "⭐", gameSlug: null, criteria: { type: "total_plays", value: 50 } },
  { slug: "all-games", title: "Completionist", description: "Play every enabled game at least once", icon: "🌟", gameSlug: null, criteria: { type: "unique_games", value: 10 } },

  // Bubble Wrap
  { slug: "bubble-100", title: "Pop Machine", description: "Pop 100 bubbles in one game", icon: "🫧", gameSlug: "bubble-wrap", criteria: { type: "score", value: 100 } },
  { slug: "bubble-500", title: "Bubble Master", description: "Pop 500 bubbles in one game", icon: "💥", gameSlug: "bubble-wrap", criteria: { type: "score", value: 500 } },

  // Stack
  { slug: "stack-10", title: "Tower Builder", description: "Stack 10 blocks", icon: "🧱", gameSlug: "stack", criteria: { type: "score", value: 10 } },
  { slug: "stack-25", title: "Skyscraper", description: "Stack 25 blocks", icon: "🏗️", gameSlug: "stack", criteria: { type: "score", value: 25 } },

  // Color Match
  { slug: "color-90", title: "Sharp Eyes", description: "Get 90%+ accuracy in Color Match", icon: "👁️", gameSlug: "color-match", criteria: { type: "score", value: 90 } },

  // Sudoku
  { slug: "sudoku-fast", title: "Speed Solver", description: "Complete Sudoku in under 60 seconds", icon: "⚡", gameSlug: "sudoku-lite", criteria: { type: "time_under", value: 60 } },

  // Lo-Fi Typer
  { slug: "typer-combo-20", title: "On Fire", description: "Get a 20 combo in Lo-Fi Typer", icon: "🔥", gameSlug: "lo-fi-typer", criteria: { type: "combo", value: 20 } },

  // Syntax Breaker
  { slug: "syntax-perfect", title: "Bug Squasher", description: "Complete all 5 levels in Syntax Breaker", icon: "🐛", gameSlug: "syntax-breaker", criteria: { type: "score", value: 50 } },

  // Gacha
  { slug: "gacha-legendary", title: "Lucky Star", description: "Pull a legendary item", icon: "✨", gameSlug: "gacha-capsule", criteria: { type: "legendary_pull", value: 1 } },
  { slug: "gacha-collector", title: "Collector", description: "Collect 15 unique items", icon: "🎁", gameSlug: "gacha-capsule", criteria: { type: "unique_items", value: 15 } },
];

export function getAchievementBySlug(slug: string) {
  return achievementDefs.find(a => a.slug === slug);
}

export function getGameAchievements(gameSlug: string) {
  return achievementDefs.filter(a => a.gameSlug === gameSlug);
}

export function getGlobalAchievements() {
  return achievementDefs.filter(a => a.gameSlug === null);
}
