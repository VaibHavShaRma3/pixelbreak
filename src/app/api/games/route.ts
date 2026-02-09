import { NextRequest, NextResponse } from "next/server";
import { gameRegistry, getEnabledGames, getGameBySlug } from "@/lib/game-registry";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const enabledOnly = searchParams.get("enabled") !== "false";

  if (slug) {
    const game = getGameBySlug(slug);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    return NextResponse.json({ game });
  }

  let games = enabledOnly ? getEnabledGames() : gameRegistry;

  if (category) {
    games = games.filter((g) => g.category === category);
  }

  return NextResponse.json({ games });
}
