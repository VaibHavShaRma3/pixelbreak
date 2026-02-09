import Link from "next/link";
import { Gamepad2, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { GamePreview } from "@/components/ui/game-preview";
import { getEnabledGames } from "@/lib/game-registry";

export default function HomePage() {
  const games = getEnabledGames();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-8 py-32 text-center">
          <ScrollReveal direction="down" delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-pixel/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-accent-pixel" />
              <span className="text-sm font-medium text-accent-pixel">
                19 games. Zero installs.
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <h1 className="font-[family-name:var(--font-pixel)] text-3xl leading-relaxed sm:text-5xl text-foreground">
              PixelBreak
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <p className="max-w-2xl text-xl text-muted leading-relaxed">
              Browser-based games across arcade, puzzle, creative, and chill
              categories. Compete on leaderboards, track your stats, and have fun.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={450}>
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
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Games — alternating section band */}
      <section className="bg-surface-2 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="flex items-center justify-between pb-8">
              <h2 className="text-3xl font-bold text-foreground">
                Featured Games
              </h2>
              <Link
                href="/games"
                className="flex items-center gap-1 text-sm text-accent-primary hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, i) => (
              <ScrollReveal key={game.slug} direction="up" delay={i * 100}>
                <Link href={`/games/${game.slug}`}>
                  <TiltCard
                    glowColor={game.color}
                    className="group h-full cursor-pointer"
                  >
                    <div
                      className="flex h-32 items-center justify-center rounded-lg transition-all duration-300"
                      style={{ backgroundColor: `${game.color}08` }}
                    >
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        <GamePreview slug={game.slug} color={game.color} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-semibold text-foreground group-hover:text-accent-primary transition-colors">
                        {game.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge>{game.category}</Badge>
                      <Badge variant="outline">{game.difficulty}</Badge>
                    </div>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — clean centered text */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              label: "Games",
              value: 19,
              icon: Gamepad2,
            },
            {
              label: "Categories",
              value: 4,
              icon: Sparkles,
            },
            {
              label: "Leaderboards",
              value: "Per Game",
              icon: Trophy,
              isText: true,
            },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 150}>
              <div className="text-center py-6">
                <stat.icon className="mx-auto h-8 w-8 text-muted mb-3" />
                <p className="text-5xl font-black text-foreground">
                  {stat.isText ? (
                    stat.value
                  ) : (
                    <AnimatedCounter
                      value={stat.value as number}
                      duration={1500}
                    />
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section — full-width band */}
      <section className="bg-accent-secondary text-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl font-bold">Ready to take a break?</h2>
            <p className="mt-3 text-white/80 text-lg">
              Jump into any game instantly — no downloads, no signups required.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-white text-accent-secondary hover:bg-white/90 shadow-sm"
              asChild
            >
              <Link href="/games">
                <Gamepad2 className="h-5 w-5" />
                Browse Games
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
