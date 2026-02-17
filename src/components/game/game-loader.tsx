"use client";

import dynamic from "next/dynamic";
import { GameShell } from "@/components/game/game-shell";
import type { GameConfig } from "@/types/game";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gameComponents: Record<string, React.ComponentType<any>> = {
  "bubble-wrap": dynamic(() => import("@/games/bubble-wrap"), { ssr: false }),
  "color-match": dynamic(() => import("@/games/color-match"), { ssr: false }),
  stack: dynamic(() => import("@/games/stack"), { ssr: false }),
  "sudoku-lite": dynamic(() => import("@/games/sudoku-lite"), { ssr: false }),
  "daily-pixel-puzzle": dynamic(() => import("@/games/daily-pixel-puzzle"), { ssr: false }),
  "lo-fi-typer": dynamic(() => import("@/games/lo-fi-typer"), { ssr: false }),
  "falling-sand": dynamic(() => import("@/games/falling-sand"), { ssr: false }),
  "syntax-breaker": dynamic(() => import("@/games/syntax-breaker"), { ssr: false }),
  "constellation-hunter": dynamic(() => import("@/games/constellation-hunter"), { ssr: false }),
  "gacha-capsule": dynamic(() => import("@/games/gacha-capsule"), { ssr: false }),
  "workspace-pet": dynamic(() => import("@/games/workspace-pet"), { ssr: false }),
  "neon-rhythm": dynamic(() => import("@/games/neon-rhythm"), { ssr: false }),
  "hexagon-land": dynamic(() => import("@/games/hexagon-land"), { ssr: false }),
  "one-minute-barista": dynamic(() => import("@/games/one-minute-barista"), { ssr: false }),
  "zen-garden": dynamic(() => import("@/games/zen-garden"), { ssr: false }),
  "focus-forest": dynamic(() => import("@/games/focus-forest"), { ssr: false }),
  "magnetic-poetry": dynamic(() => import("@/games/magnetic-poetry"), { ssr: false }),
  "community-grid": dynamic(() => import("@/games/community-grid"), { ssr: false }),
  velocity: dynamic(() => import("@/games/velocity"), { ssr: false }),
  nerdle: dynamic(() => import("@/games/nerdle"), { ssr: false }),
  connections: dynamic(() => import("@/games/connections"), { ssr: false }),
  "lights-out": dynamic(() => import("@/games/lights-out"), { ssr: false }),
  kenken: dynamic(() => import("@/games/kenken"), { ssr: false }),
  "monty-hall": dynamic(() => import("@/games/monty-hall"), { ssr: false }),
  "dice-trader": dynamic(() => import("@/games/dice-trader"), { ssr: false }),
  "sequence-solver": dynamic(() => import("@/games/sequence-solver"), { ssr: false }),
  "logic-grid": dynamic(() => import("@/games/logic-grid"), { ssr: false }),
  nonogram: dynamic(() => import("@/games/nonogram"), { ssr: false }),
  "memory-matrix": dynamic(() => import("@/games/memory-matrix"), { ssr: false }),
  "cube-roll": dynamic(() => import("@/games/cube-roll"), { ssr: false }),
  "marble-maze": dynamic(() => import("@/games/marble-maze"), { ssr: false }),
  "tower-of-hanoi-3d": dynamic(() => import("@/games/tower-of-hanoi-3d"), { ssr: false }),
  "sokoban-3d": dynamic(() => import("@/games/sokoban-3d"), { ssr: false }),
  "orbit-architect": dynamic(() => import("@/games/orbit-architect"), { ssr: false }),
};

interface GameLoaderProps {
  config: GameConfig;
}

export function GameLoader({ config }: GameLoaderProps) {
  const GameComponent = gameComponents[config.slug];

  return (
    <GameShell config={config}>
      {(props) => (GameComponent ? <GameComponent {...props} /> : null)}
    </GameShell>
  );
}
