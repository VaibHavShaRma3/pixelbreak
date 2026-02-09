"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Trophy, Gamepad2, Calendar, Star } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";

interface GameStat {
  gameSlug: string;
  totalPlays: number;
  highScore: number;
  totalScore: number;
  averageScore: number;
  lastPlayedAt: string | null;
}

interface UserStats {
  user: {
    id: string | null;
    name: string;
    image: string | null;
    username: string;
    bio: string | null;
    createdAt: string;
  };
  gameStats: GameStat[];
  totalGamesPlayed: number;
  totalScore: number;
  favoriteGame: string | null;
  achievementsUnlocked: number;
  unlockedAchievements: { slug: string; unlockedAt: string }[];
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/stats?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        // Fallback placeholder data
        setData({
          user: {
            id: null,
            name: username,
            image: null,
            username,
            bio: null,
            createdAt: new Date().toISOString(),
          },
          gameStats: [],
          totalGamesPlayed: 0,
          totalScore: 0,
          favoriteGame: null,
          achievementsUnlocked: 0,
          unlockedAchievements: [],
        });
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="mt-8">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const user = data?.user;
  const gameStats = data?.gameStats || [];
  const totalGamesPlayed = data?.totalGamesPlayed || 0;
  const totalScore = data?.totalScore || 0;
  const achievementsUnlocked = data?.achievementsUnlocked || 0;
  const unlockedAchievements = data?.unlockedAchievements || [];
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const formatGameName = (slug: string) =>
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Profile Header */}
      <ScrollReveal direction="down">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-2 ring-neon-cyan/30">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || username}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted" />
            )}
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan">
              {user?.name || username}
            </h1>
            <p className="text-sm text-muted">@{username}</p>
            {user?.bio && (
              <p className="mt-1 text-sm text-foreground/80">{user.bio}</p>
            )}
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
              <Calendar className="h-3 w-3" />
              Joined {joinDate}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Games Played",
            value: totalGamesPlayed,
            icon: Gamepad2,
            color: "text-neon-cyan",
            glowColor: "#00fff5",
          },
          {
            label: "Total Score",
            value: totalScore,
            icon: Star,
            color: "text-neon-yellow",
            glowColor: "#ffe600",
          },
          {
            label: "Achievements",
            value: achievementsUnlocked,
            icon: Trophy,
            color: "text-neon-green",
            glowColor: "#39ff14",
          },
        ].map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 120}>
            <TiltCard glowColor={stat.glowColor} className="text-center">
              <div className="flex flex-col items-center gap-2 py-4">
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                <p className="font-[family-name:var(--font-pixel)] text-2xl text-foreground">
                  <AnimatedCounter value={stat.value} duration={1500} />
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <ScrollReveal direction="up" delay={100}>
        <div className="mt-12">
          <h3 className="font-[family-name:var(--font-pixel)] text-lg text-foreground">
            Recent Activity
          </h3>
          <div className="mt-4 rounded-xl border border-border bg-surface p-8 text-center">
            <Gamepad2 className="mx-auto h-8 w-8 text-muted/30" />
            <p className="mt-2 text-sm text-muted">
              Activity feed coming soon. Play games to see your history here!
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Game Stats Grid */}
      {gameStats.length > 0 && (
        <ScrollReveal direction="up" delay={150}>
          <div className="mt-12">
            <h3 className="font-[family-name:var(--font-pixel)] text-lg text-foreground">
              Game Stats
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gameStats.map((stat, i) => (
                <ScrollReveal key={stat.gameSlug} direction="up" delay={i * 80}>
                  <TiltCard glowColor="#ff2d95" className="h-full">
                    <h4 className="font-semibold text-foreground">
                      {formatGameName(stat.gameSlug)}
                    </h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Plays</span>
                        <span className="font-mono text-foreground">
                          {stat.totalPlays}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">High Score</span>
                        <span className="font-mono text-neon-cyan">
                          {stat.highScore.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Avg Score</span>
                        <span className="font-mono text-foreground">
                          {Math.round(stat.averageScore).toLocaleString()}
                        </span>
                      </div>
                      {stat.lastPlayedAt && (
                        <p className="pt-1 text-[11px] text-muted">
                          Last played{" "}
                          {new Date(stat.lastPlayedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Achievements Showcase */}
      <ScrollReveal direction="up" delay={200}>
        <div className="mt-12">
          <AchievementShowcase unlockedAchievements={unlockedAchievements} />
        </div>
      </ScrollReveal>
    </div>
  );
}
