"use client";

import { useState, useCallback, useEffect } from "react";
import { Trophy, Play, Pause, RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfetti } from "@/components/ui/confetti";
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
  const [scoreFlash, setScoreFlash] = useState(false);
  const { fireConfetti, fireStars } = useConfetti();

  // Flash score when it changes
  useEffect(() => {
    if (score > 0) {
      setScoreFlash(true);
      const t = setTimeout(() => setScoreFlash(false), 200);
      return () => clearTimeout(t);
    }
  }, [score]);

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
      // Confetti celebration!
      fireConfetti();
      setTimeout(() => fireStars(), 300);
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
      {/* HUD with neon border */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all neon-border dark:bg-surface/80 dark:backdrop-blur-sm">
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
          {/* Score display with neon flash */}
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent-yellow" />
            <span
              className="font-mono text-lg font-bold transition-all duration-150"
              style={{
                color: scoreFlash ? config.color : "var(--foreground)",
                transform: scoreFlash ? "scale(1.2)" : "scale(1)",
                textShadow: scoreFlash ? `0 0 12px ${config.color}, 0 0 24px ${config.color}40` : "none",
              }}
            >
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
      <div className="relative min-h-[500px] rounded-2xl border border-border bg-surface shadow-sm overflow-hidden dark:bg-surface/80">
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-fade-up">
            <Sparkles className="h-6 w-6 text-accent-yellow animate-pulse" />
            <h2
              className="font-[family-name:var(--font-pixel)] text-xl neon-text"
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

            {/* How to Play instructions */}
            {config.howToPlay && config.howToPlay.length > 0 && (
              <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-2 p-5 dark:bg-surface-2/80">
                <div className="mb-3 flex items-center gap-2 text-base font-bold" style={{ color: config.color }}>
                  <BookOpen className="h-5 w-5" />
                  How to Play
                </div>
                <ul className="space-y-2.5">
                  {config.howToPlay.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button size="lg" onClick={startGame} className="group">
              <Play className="h-5 w-5 transition-transform group-hover:scale-125" />
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
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-up">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-pixel)] text-lg text-accent-yellow neon-text" style={{ textShadow: "0 0 15px var(--accent-yellow), 0 0 30px var(--accent-yellow)" }}>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm animate-fade-up">
            <p className="font-[family-name:var(--font-pixel)] text-lg text-foreground neon-text">
              GAME OVER
            </p>
            <div className="text-center">
              <p className="text-sm text-muted">Final Score</p>
              <p
                className="font-mono text-5xl font-bold text-accent-primary"
                style={{ textShadow: "0 0 20px var(--accent-primary), 0 0 40px var(--accent-primary)" }}
              >
                {finalScore !== null
                  ? config.scoreType === "time"
                    ? formatTime(finalScore)
                    : formatScore(finalScore)
                  : 0}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={startGame} className="group">
                <Play className="h-4 w-4 transition-transform group-hover:scale-125" />
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (finalScore !== null) {
                    callbacks.onScoreSubmit(finalScore);
                    fireStars();
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
