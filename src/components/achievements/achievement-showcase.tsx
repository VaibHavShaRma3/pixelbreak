"use client";

import { achievementDefs, getGlobalAchievements, getGameAchievements } from "@/lib/achievements";
import { AchievementCard } from "./achievement-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface UnlockedAchievement {
  slug: string;
  unlockedAt: string;
}

interface AchievementShowcaseProps {
  userId?: string;
  unlockedAchievements?: UnlockedAchievement[];
}

export function AchievementShowcase({ unlockedAchievements = [] }: AchievementShowcaseProps) {
  const unlockedMap = new Map(
    unlockedAchievements.map((a) => [a.slug, new Date(a.unlockedAt)])
  );

  const totalUnlocked = unlockedMap.size;
  const totalAchievements = achievementDefs.length;

  const globalAchievements = getGlobalAchievements();

  // Collect unique game slugs preserving definition order
  const gameSlugsSeen = new Set<string>();
  const gameSlugs: string[] = [];
  for (const a of achievementDefs) {
    if (a.gameSlug && !gameSlugsSeen.has(a.gameSlug)) {
      gameSlugsSeen.add(a.gameSlug);
      gameSlugs.push(a.gameSlug);
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-pixel)] text-lg text-foreground">
          Achievements
        </h3>
        <span className="text-sm text-muted">
          {totalUnlocked}/{totalAchievements} unlocked
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-neon-cyan transition-all duration-700"
          style={{
            width: `${totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0}%`,
            boxShadow: "0 0 8px rgba(0,255,245,0.5)",
          }}
        />
      </div>

      {/* Global achievements */}
      <div>
        <ScrollReveal>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neon-cyan">
            Global
          </h4>
        </ScrollReveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {globalAchievements.map((achievement, i) => (
            <ScrollReveal key={achievement.slug} direction="up" delay={i * 60}>
              <AchievementCard
                achievement={achievement}
                unlocked={unlockedMap.has(achievement.slug)}
                unlockedAt={unlockedMap.get(achievement.slug)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Per-game achievements */}
      {gameSlugs.map((gameSlug) => {
        const gameAchievements = getGameAchievements(gameSlug);
        const gameName = gameSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return (
          <div key={gameSlug}>
            <ScrollReveal>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neon-pink">
                {gameName}
              </h4>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gameAchievements.map((achievement, i) => (
                <ScrollReveal key={achievement.slug} direction="up" delay={i * 60}>
                  <AchievementCard
                    achievement={achievement}
                    unlocked={unlockedMap.has(achievement.slug)}
                    unlockedAt={unlockedMap.get(achievement.slug)}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
