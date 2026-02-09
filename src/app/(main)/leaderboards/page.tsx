import { Trophy, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnabledGames } from "@/lib/game-registry";

export const metadata = {
  title: "Leaderboards",
};

export default function LeaderboardsPage() {
  const games = getEnabledGames();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-neon-yellow" />
        <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan">
          Leaderboards
        </h1>
      </div>
      <p className="mt-2 text-muted">
        Compete for the top spot across all games.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link key={game.slug} href={`/games/${game.slug}`}>
            <Card className="group hover:border-neon-cyan/50 transition-all">
              <CardContent className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${game.color}15` }}
                >
                  <Gamepad2
                    className="h-7 w-7"
                    style={{ color: game.color }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
                    {game.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{game.category}</Badge>
                    <span className="text-xs text-muted">
                      {game.scoreType} based
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
