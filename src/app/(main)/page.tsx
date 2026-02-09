import Link from "next/link";
import { Gamepad2, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnabledGames } from "@/lib/game-registry";

export default function HomePage() {
  const games = getEnabledGames();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-8 py-20 text-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-neon-yellow" />
          <span className="text-sm text-neon-yellow">18 games. Zero installs.</span>
        </div>
        <h1 className="font-[family-name:var(--font-pixel)] text-3xl leading-relaxed text-neon-cyan glow-cyan sm:text-4xl">
          PixelBreak
        </h1>
        <p className="max-w-lg text-lg text-muted">
          Browser-based games across arcade, puzzle, creative, and chill
          categories. Compete on leaderboards, track your stats, and have fun.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/games">
              <Gamepad2 className="h-5 w-5" />
              Play Now
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/leaderboards">
              <Trophy className="h-5 w-5" />
              Leaderboards
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16">
        <div className="flex items-center justify-between pb-8">
          <h2 className="font-[family-name:var(--font-pixel)] text-lg text-foreground">
            Featured Games
          </h2>
          <Link
            href="/games"
            className="flex items-center gap-1 text-sm text-neon-cyan hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`}>
              <Card className="group h-full hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,245,0.1)]">
                <CardContent className="flex flex-col gap-3">
                  <div
                    className="flex h-32 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${game.color}10` }}
                  >
                    <Gamepad2
                      className="h-12 w-12 transition-transform group-hover:scale-110"
                      style={{ color: game.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {game.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted line-clamp-2">
                      {game.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{game.category}</Badge>
                    <Badge variant="outline">{game.difficulty}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Games", value: "18", icon: Gamepad2, color: "text-neon-cyan" },
            { label: "Categories", value: "4", icon: Sparkles, color: "text-neon-pink" },
            { label: "Leaderboards", value: "Per Game", icon: Trophy, color: "text-neon-green" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="flex flex-col items-center gap-2 py-6">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <p className="font-[family-name:var(--font-pixel)] text-2xl text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
