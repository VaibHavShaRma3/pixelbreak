"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Medal, Gamepad2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Skeleton, LeaderboardSkeleton } from "@/components/ui/skeleton";
import { formatScore, timeAgo } from "@/lib/utils";
import { getEnabledGames } from "@/lib/game-registry";
import type { LeaderboardTimeFilter, LeaderboardEntry, GameConfig } from "@/types/game";

const TIME_FILTERS: { value: LeaderboardTimeFilter; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "alltime", label: "All Time" },
];

function getRankDisplay(rank: number) {
  if (rank === 1)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-yellow/20">
        <Trophy className="h-4 w-4 text-neon-yellow" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400/20">
        <Medal className="h-4 w-4 text-gray-400" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700/20">
        <Medal className="h-4 w-4 text-amber-600" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <span className="text-sm font-bold text-muted">{rank}</span>
    </div>
  );
}

// Mini leaderboard card for the "All Games" overview grid
function GameLeaderboardPreview({
  game,
  period,
}: {
  game: GameConfig;
  period: LeaderboardTimeFilter;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scores?gameSlug=${game.slug}&period=${period}&limit=3`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.scores || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, [game.slug, period]);

  return (
    <TiltCard glowColor={game.color} className="h-full">
      <div className="flex items-center gap-3 pb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${game.color}15` }}
        >
          <Gamepad2 className="h-5 w-5" style={{ color: game.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{game.title}</h3>
          <Badge variant="outline" className="text-[10px]">
            {game.category}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">No scores yet</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.username}`}
              className="flex items-center gap-2 rounded-md bg-surface-2 px-2 py-1.5"
            >
              {getRankDisplay(entry.rank)}
              <Link
                href={`/profile/${entry.username}`}
                className="flex-1 truncate text-xs text-foreground hover:text-neon-cyan transition-colors"
              >
                {entry.username || "Anonymous"}
              </Link>
              <span className="font-mono text-xs font-bold text-neon-cyan">
                {formatScore(entry.score)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/games/${game.slug}`}
        className="mt-3 block text-center text-xs text-muted hover:text-neon-cyan transition-colors"
      >
        View full leaderboard
      </Link>
    </TiltCard>
  );
}

// Full leaderboard table for a selected game
function FullGameLeaderboard({
  game,
  period,
}: {
  game: GameConfig;
  period: LeaderboardTimeFilter;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scores?gameSlug=${game.slug}&period=${period}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.scores || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, [game.slug, period]);

  if (loading) {
    return (
      <div className="mt-6">
        <LeaderboardSkeleton />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 py-12">
        <Trophy className="h-10 w-10 text-muted/30" />
        <p className="text-sm text-muted">
          No scores yet for this period. Be the first!
        </p>
        <Button size="sm" asChild>
          <Link href={`/games/${game.slug}`}>Play {game.title}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2">
      {entries.map((entry, i) => (
        <div
          key={`${entry.rank}-${entry.username}-${i}`}
          className="flex items-center gap-4 rounded-lg bg-surface px-4 py-3 border border-border transition-all hover:border-neon-cyan/30"
          style={{
            animation: `fade-up 0.3s ease-out ${i * 40}ms both`,
          }}
        >
          {getRankDisplay(entry.rank)}
          <Link
            href={`/profile/${entry.username}`}
            className="flex-1 truncate font-medium text-foreground hover:text-neon-cyan transition-colors"
          >
            {entry.username || "Anonymous"}
          </Link>
          <span className="font-mono text-sm font-bold text-neon-cyan">
            {formatScore(entry.score)}
          </span>
          {entry.createdAt && (
            <span className="hidden text-xs text-muted sm:block">
              {timeAgo(new Date(entry.createdAt))}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardsPage() {
  const games = getEnabledGames();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [period, setPeriod] = useState<LeaderboardTimeFilter>("alltime");

  const activeGame = selectedGame
    ? games.find((g) => g.slug === selectedGame)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <ScrollReveal direction="down">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-neon-yellow" />
          <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan">
            Global Leaderboards
          </h1>
        </div>
        <p className="mt-2 text-muted">
          Compete for the top spot across all games. Select a game to see its
          full rankings.
        </p>
      </ScrollReveal>

      {/* Game filter pills */}
      <ScrollReveal direction="up" delay={100}>
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGame(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              selectedGame === null
                ? "bg-neon-cyan text-background shadow-[0_0_10px_rgba(0,255,245,0.3)]"
                : "border border-border text-muted hover:border-neon-cyan/50 hover:text-foreground"
            }`}
          >
            All Games
          </button>
          {games.map((game) => (
            <button
              key={game.slug}
              onClick={() => setSelectedGame(game.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                selectedGame === game.slug
                  ? "text-background"
                  : "border border-border text-muted hover:text-foreground"
              }`}
              style={
                selectedGame === game.slug
                  ? {
                      backgroundColor: game.color,
                      boxShadow: `0 0 12px ${game.color}50`,
                    }
                  : undefined
              }
            >
              {game.title}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Time filter pills */}
      <ScrollReveal direction="up" delay={150}>
        <div className="mt-4 flex gap-1">
          {TIME_FILTERS.map((tf) => (
            <Button
              key={tf.value}
              size="sm"
              variant={period === tf.value ? "default" : "ghost"}
              onClick={() => setPeriod(tf.value)}
              className="text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              {tf.label}
            </Button>
          ))}
        </div>
      </ScrollReveal>

      {/* Content */}
      {selectedGame === null ? (
        // All Games overview grid
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, i) => (
              <ScrollReveal key={game.slug} direction="up" delay={i * 60}>
                <GameLeaderboardPreview game={game} period={period} />
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      ) : activeGame ? (
        // Single game full leaderboard
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${activeGame.color}15` }}
              >
                <Gamepad2 className="h-6 w-6" style={{ color: activeGame.color }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {activeGame.title}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeGame.category}</Badge>
                  <span className="text-xs text-muted">
                    {activeGame.scoreType} based
                  </span>
                </div>
              </div>
            </div>
            <FullGameLeaderboard game={activeGame} period={period} />
          </div>
        </ScrollReveal>
      ) : null}
    </div>
  );
}
