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
