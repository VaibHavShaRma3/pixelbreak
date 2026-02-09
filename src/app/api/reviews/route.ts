import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameSlug = searchParams.get("gameSlug");

  if (!gameSlug) {
    return NextResponse.json(
      { error: "gameSlug is required" },
      { status: 400 }
    );
  }

  try {
    const results = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
        username: users.name,
        avatarUrl: users.image,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.gameSlug, gameSlug))
      .orderBy(desc(reviews.createdAt))
      .limit(50);

    return NextResponse.json({ reviews: results });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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
    const { gameSlug, rating, content } = await request.json();

    if (!gameSlug || !rating || !content) {
      return NextResponse.json(
        { error: "gameSlug, rating, and content are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const [newReview] = await db
      .insert(reviews)
      .values({
        userId: session.user.id,
        gameSlug,
        rating,
        content,
      })
      .returning();

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
