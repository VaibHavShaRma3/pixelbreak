import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userGameStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats = await db
      .select()
      .from(userGameStats)
      .where(eq(userGameStats.userId, user.id));

    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, bio } = await request.json();

    const updates: Record<string, string> = {};
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
