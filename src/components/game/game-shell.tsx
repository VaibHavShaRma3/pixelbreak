"use client";

import { useState, useCallback } from "react";
import { Trophy, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatTime } from "@/lib/utils";
import type { GameConfig, GameState, GameCallbacks } from "@/types/game";

interface GameShellProps {
  config: GameConfig;
  children: (props: {
    gameState: GameState;
    score: number;
    setScore: (s: number | ((prev: number) => number)) => void;
    callbacks: GameCallbacks;
    startGame: () => void;
    pauseGame: () => void;
    resetGame: () => void;
  }) => React.ReactNode;
}

export function GameShell({ config, children }: GameShellProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setFinalScore(null);
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
  }, []);

  const resetGame = useCallback(() => {
    setGameState("idle");
    setScore(0);
    setFinalScore(null);
  }, []);

  const callbacks: GameCallbacks = {
    onGameStart: startGame,
    onGameEnd: (final: number) => {
      setFinalScore(final);
      setGameState("gameover");
    },
    onScoreSubmit: async (submittedScore: number, metadata?: Record<string, unknown>) => {
      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug: config.slug,
            score: submittedScore,
            metadata,
          }),
        });
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <h1
            className="font-[family-name:var(--font-pixel)] text-sm"
            style={{ color: config.color }}
          >
            {config.title}
          </h1>
          <Badge variant="outline">{config.category}</Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Score display */}
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-yellow" />
            <span className="font-mono text-lg font-bold text-foreground">
              {config.scoreType === "time"
                ? formatTime(score)
                : formatScore(score)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {gameState === "idle" && (
              <Button size="sm" onClick={startGame}>
                <Play className="h-4 w-4" />
                Play
              </Button>
            )}
            {(gameState === "playing" || gameState === "paused") && (
              <>
                <Button size="icon" variant="outline" onClick={pauseGame}>
                  <Pause className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="relative min-h-[500px] rounded-xl border border-border bg-surface overflow-hidden">
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <h2
              className="font-[family-name:var(--font-pixel)] text-xl"
              style={{ color: config.color }}
            >
              {config.title}
            </h2>
            <p className="max-w-md text-center text-muted">
              {config.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Badge>{config.difficulty}</Badge>
              <span>{config.estimatedPlayTime}</span>
            </div>
            <Button size="lg" onClick={startGame}>
              <Play className="h-5 w-5" />
              Start Game
            </Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "paused") && (
          <>
            {children({
              gameState,
              score,
              setScore,
              callbacks,
              startGame,
              pauseGame,
              resetGame,
            })}
            {gameState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-pixel)] text-lg text-neon-yellow">
                    PAUSED
                  </p>
                  <Button className="mt-4" onClick={pauseGame}>
                    Resume
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm">
            <p className="font-[family-name:var(--font-pixel)] text-lg text-neon-pink">
              GAME OVER
            </p>
            <div className="text-center">
              <p className="text-sm text-muted">Final Score</p>
              <p className="font-mono text-4xl font-bold text-neon-cyan glow-cyan">
                {finalScore !== null
                  ? config.scoreType === "time"
                    ? formatTime(finalScore)
                    : formatScore(finalScore)
                  : 0}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={startGame}>
                <Play className="h-4 w-4" />
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (finalScore !== null) {
                    callbacks.onScoreSubmit(finalScore);
                  }
                }}
              >
                <Trophy className="h-4 w-4" />
                Submit Score
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
