import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { gameRegistry } from "@/lib/game-registry";
import type { GameCategory } from "@/types/game";

const categories: { value: GameCategory; label: string; color: string }[] = [
  { value: "arcade", label: "Arcade", color: "#39ff14" },
  { value: "puzzle", label: "Puzzle", color: "#b026ff" },
  { value: "creative", label: "Creative", color: "#ffe600" },
  { value: "chill", label: "Chill", color: "#00fff5" },
];

export const metadata = {
  title: "Games",
};

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan">
        All Games
      </h1>
      <p className="mt-2 text-muted">
        18 games across 4 categories. More coming soon!
      </p>

      {categories.map((cat) => {
        const games = gameRegistry.filter((g) => g.category === cat.value);
        return (
          <section key={cat.value} className="mt-12">
            <h2
              className="font-[family-name:var(--font-pixel)] text-lg"
              style={{ color: cat.color }}
            >
              {cat.label}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Link
                  key={game.slug}
                  href={game.enabled ? `/games/${game.slug}` : "#"}
                  className={game.enabled ? "" : "pointer-events-none opacity-50"}
                >
                  <Card className="group h-full hover:border-neon-cyan/50 transition-all">
                    <CardContent className="flex items-start gap-4">
                      <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${game.color}15` }}
                      >
                        <Gamepad2
                          className="h-8 w-8"
                          style={{ color: game.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {game.title}
                          </h3>
                          {!game.enabled && (
                            <Badge variant="outline">Coming Soon</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted line-clamp-2">
                          {game.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">{game.difficulty}</Badge>
                          <span className="text-xs text-muted">
                            {game.estimatedPlayTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
