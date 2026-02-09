"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaderboardSkeleton } from "@/components/ui/skeleton";
import { formatScore } from "@/lib/utils";
import type { LeaderboardTimeFilter, LeaderboardEntry } from "@/types/game";

interface LeaderboardPanelProps {
  gameSlug: string;
  gameTitle: string;
}

const timeFilters: { value: LeaderboardTimeFilter; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "alltime", label: "All Time" },
];

export function LeaderboardPanel({ gameSlug, gameTitle }: LeaderboardPanelProps) {
  const [filter, setFilter] = useState<LeaderboardTimeFilter>("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scores?gameSlug=${gameSlug}&period=${filter}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.scores || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, [gameSlug, filter]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-yellow/20">
          <Trophy className="h-3.5 w-3.5 text-accent-yellow" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400/20">
          <Medal className="h-3.5 w-3.5 text-gray-400" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20">
          <Medal className="h-3.5 w-3.5 text-amber-600" />
        </div>
      );
    return (
      <div className="flex h-6 w-6 items-center justify-center">
        <span className="text-xs font-bold text-muted">{rank}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent-yellow" />
          Leaderboard
        </CardTitle>
        <div className="flex gap-1">
          {timeFilters.map((tf) => (
            <Button
              key={tf.value}
              size="sm"
              variant={filter === tf.value ? "default" : "ghost"}
              onClick={() => setFilter(tf.value)}
              className="text-xs"
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LeaderboardSkeleton />
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <Trophy className="h-8 w-8 text-muted/30" />
            <p className="text-center text-sm text-muted">
              No scores yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 transition-all hover:bg-surface-2/80"
                style={{
                  animation: `fade-up 0.3s ease-out ${i * 50}ms both`,
                }}
              >
                {getRankDisplay(entry.rank)}
                <div className="flex-1 truncate text-sm text-foreground">
                  {entry.username || "Anonymous"}
                </div>
                <div className="font-mono text-sm font-bold text-accent-primary">
                  {formatScore(entry.score)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
