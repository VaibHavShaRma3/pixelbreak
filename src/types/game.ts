export type RenderingMode = "dom" | "canvas" | "phaser";
export type ScoreType = "points" | "time" | "accuracy" | "combo" | "custom";
export type GameCategory = "arcade" | "puzzle" | "creative" | "chill";

export interface GameConfig {
  slug: string;
  title: string;
  description: string;
  category: GameCategory;
  scoreType: ScoreType;
  renderingMode: RenderingMode;
  thumbnail: string;
  color: string; // neon accent color for this game
  minPlayers: number;
  maxPlayers: number;
  estimatedPlayTime: string; // e.g. "2-5 min"
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  howToPlay?: string[];
  enabled: boolean;
}

export interface GameCallbacks {
  onScoreSubmit: (score: number, metadata?: Record<string, unknown>) => void;
  onGameStart: () => void;
  onGameEnd: (finalScore: number) => void;
}

export interface GameProps {
  config: GameConfig;
  callbacks: GameCallbacks;
  userId?: string;
}

export type GameState = "idle" | "playing" | "paused" | "gameover";

export interface GameShellProps {
  config: GameConfig;
  children: React.ReactNode;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatarUrl?: string;
  createdAt: Date;
}

export type LeaderboardTimeFilter = "daily" | "weekly" | "alltime";
