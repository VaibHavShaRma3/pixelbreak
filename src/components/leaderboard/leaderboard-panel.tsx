"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-neon-yellow" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs text-muted w-4 text-center">{rank}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-neon-yellow" />
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
          <div className="flex items-center justify-center py-8">
            <Clock className="h-5 w-5 animate-spin text-muted" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No scores yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2"
              >
                <div className="flex w-6 items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1 truncate text-sm text-foreground">
                  {entry.username || "Anonymous"}
                </div>
                <div className="font-mono text-sm font-bold text-neon-cyan">
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
