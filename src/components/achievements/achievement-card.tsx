"use client";

import { TiltCard } from "@/components/ui/tilt-card";
import type { AchievementDef } from "@/lib/achievements";

interface AchievementCardProps {
  achievement: AchievementDef;
  unlocked: boolean;
  unlockedAt?: Date;
}

export function AchievementCard({ achievement, unlocked, unlockedAt }: AchievementCardProps) {
  const glowColor = achievement.gameSlug === null ? "#00fff5" : "#ff2d95";

  return (
    <TiltCard
      glowColor={unlocked ? glowColor : "#333"}
      className={`relative transition-all duration-300 ${
        unlocked
          ? "border-opacity-100"
          : "grayscale opacity-60 hover:opacity-80"
      }`}
    >
      {/* Unlock glow ring */}
      {unlocked && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-40"
          style={{
            boxShadow: `0 0 16px ${glowColor}40, 0 0 32px ${glowColor}20`,
          }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl ${
            unlocked ? "bg-surface-2" : "bg-surface-2/50"
          }`}
        >
          {unlocked ? achievement.icon : "🔒"}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h4 className={`font-semibold ${unlocked ? "text-foreground" : "text-muted"}`}>
            {achievement.title}
          </h4>
          <p className="mt-0.5 text-xs text-muted line-clamp-2">
            {unlocked ? achievement.description : "???"}
          </p>

          {/* Game tag */}
          {achievement.gameSlug && (
            <span
              className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: unlocked ? `${glowColor}15` : "rgba(255,255,255,0.05)",
                color: unlocked ? glowColor : "var(--muted)",
              }}
            >
              {achievement.gameSlug.replace(/-/g, " ")}
            </span>
          )}
          {!achievement.gameSlug && (
            <span
              className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: unlocked ? `${glowColor}15` : "rgba(255,255,255,0.05)",
                color: unlocked ? glowColor : "var(--muted)",
              }}
            >
              Global
            </span>
          )}

          {/* Unlock date */}
          {unlocked && unlockedAt && (
            <p className="mt-1 text-[10px] text-muted">
              Unlocked {unlockedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
