import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userGameStats, scores, userAchievements, achievements } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch user info
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        username: users.username,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      // Return placeholder data so the profile page can still render
      return NextResponse.json({
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
    }

    // Fetch per-game stats
    const gameStats = await db
      .select({
        gameSlug: userGameStats.gameSlug,
        totalPlays: userGameStats.totalPlays,
        highScore: userGameStats.highScore,
        totalScore: userGameStats.totalScore,
        averageScore: userGameStats.averageScore,
        lastPlayedAt: userGameStats.lastPlayedAt,
      })
      .from(userGameStats)
      .where(eq(userGameStats.userId, user.id))
      .orderBy(desc(userGameStats.totalPlays));

    // Aggregate totals
    const totalGamesPlayed = gameStats.reduce((sum, g) => sum + g.totalPlays, 0);
    const totalScore = gameStats.reduce((sum, g) => sum + g.totalScore, 0);
    const favoriteGame =
      gameStats.length > 0
        ? gameStats.reduce((best, g) =>
            g.totalPlays > best.totalPlays ? g : best
          ).gameSlug
        : null;

    // Fetch unlocked achievements
    let unlockedAchievements: { slug: string; unlockedAt: Date }[] = [];
    try {
      const userAchievementRows = await db
        .select({
          slug: achievements.slug,
          unlockedAt: userAchievements.unlockedAt,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, user.id));

      unlockedAchievements = userAchievementRows;
    } catch {
      // achievements tables may not exist yet; gracefully return empty
      unlockedAchievements = [];
    }

    return NextResponse.json({
      user,
      gameStats,
      totalGamesPlayed,
      totalScore,
      favoriteGame,
      achievementsUnlocked: unlockedAchievements.length,
      unlockedAchievements,
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
