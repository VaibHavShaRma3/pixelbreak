import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scores, users } from "@/lib/db/schema";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameSlug = searchParams.get("gameSlug");
  const period = searchParams.get("period") || "alltime";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);

  if (!gameSlug) {
    return NextResponse.json(
      { error: "gameSlug is required" },
      { status: 400 }
    );
  }

  try {
    let dateFilter: Date | null = null;
    const now = new Date();

    if (period === "daily") {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "weekly") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const conditions = [eq(scores.gameSlug, gameSlug)];
    if (dateFilter) {
      conditions.push(gte(scores.createdAt, dateFilter));
    }

    const results = await db
      .select({
        score: scores.score,
        username: users.name,
        avatarUrl: users.image,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(scores.score))
      .limit(limit);

    const leaderboard = results.map((row, index) => ({
      rank: index + 1,
      username: row.username || "Anonymous",
      score: row.score,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({ scores: leaderboard });
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gameSlug, score, metadata } = body;

    if (!gameSlug || typeof score !== "number") {
      return NextResponse.json(
        { error: "gameSlug and score are required" },
        { status: 400 }
      );
    }

    const [newScore] = await db
      .insert(scores)
      .values({
        userId: session.user.id,
        gameSlug,
        score,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json({ score: newScore }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit score:", error);
    return NextResponse.json(
      { error: "Failed to submit score" },
      { status: 500 }
    );
  }
}
