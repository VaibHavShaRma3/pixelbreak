import Link from "next/link";
import { Gamepad2, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGradientText } from "@/components/ui/animated-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ParticleBackground } from "@/components/ui/particle-background";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { GamePreview } from "@/components/ui/game-preview";
import { getEnabledGames } from "@/lib/game-registry";

export default function HomePage() {
  const games = getEnabledGames();

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero with particle background */}
      <section className="relative flex flex-col items-center gap-8 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <ParticleBackground count={50} />
        </div>

        <ScrollReveal direction="down" delay={0}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neon-yellow" />
            <span className="text-sm text-neon-yellow">
              19 games. Zero installs.
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={150}>
          <h1 className="font-[family-name:var(--font-pixel)] text-3xl leading-relaxed sm:text-5xl">
            <AnimatedGradientText>PixelBreak</AnimatedGradientText>
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={300}>
          <p className="max-w-lg text-lg text-muted">
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
      </section>

      {/* Featured Games with tilt cards and preview animations */}
      <section className="py-16">
        <ScrollReveal>
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
                    <h3 className="font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
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
      </section>

      {/* Stats Section with animated counters */}
      <section className="py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              label: "Games",
              value: 19,
              icon: Gamepad2,
              color: "text-neon-cyan",
              glowColor: "#00fff5",
            },
            {
              label: "Categories",
              value: 4,
              icon: Sparkles,
              color: "text-neon-pink",
              glowColor: "#ff2d95",
            },
            {
              label: "Leaderboards",
              value: "Per Game",
              icon: Trophy,
              color: "text-neon-green",
              glowColor: "#39ff14",
              isText: true,
            },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 150}>
              <TiltCard glowColor={stat.glowColor} className="text-center">
                <div className="flex flex-col items-center gap-2 py-6">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <p className="font-[family-name:var(--font-pixel)] text-2xl text-foreground">
                    {stat.isText ? (
                      stat.value
                    ) : (
                      <AnimatedCounter
                        value={stat.value as number}
                        duration={1500}
                      />
                    )}
                  </p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
