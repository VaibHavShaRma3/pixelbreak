"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import { GamePreview } from "@/components/ui/game-preview";
import { CategoryFilter } from "@/components/ui/category-filter";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { gameRegistry } from "@/lib/game-registry";
import type { GameCategory } from "@/types/game";

const categories: { value: GameCategory; label: string; color: string }[] = [
  { value: "arcade", label: "Arcade", color: "#16A34A" },
  { value: "puzzle", label: "Puzzle", color: "#7C3AED" },
  { value: "creative", label: "Creative", color: "#D97706" },
  { value: "chill", label: "Chill", color: "#0891B2" },
];

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredGames = selectedCategory
    ? gameRegistry.filter((g) => g.category === selectedCategory)
    : gameRegistry;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <ScrollReveal>
        <h1 className="text-4xl font-extrabold text-foreground">
          All Games
        </h1>
        <p className="mt-2 text-muted">
          19 games across 4 categories. More coming soon!
        </p>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <CategoryFilter
          categories={categories}
          onChange={setSelectedCategory}
          className="mt-8"
        />
      </ScrollReveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map((game, i) => (
          <ScrollReveal key={game.slug} direction="up" delay={i * 60}>
            <Link
              href={game.enabled ? `/games/${game.slug}` : "#"}
              className={game.enabled ? "" : "pointer-events-none"}
            >
              <TiltCard
                glowColor={game.color}
                className={`group h-full ${
                  !game.enabled ? "opacity-40" : "cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg overflow-hidden"
                    style={{ backgroundColor: `${game.color}12` }}
                  >
                    {game.enabled ? (
                      <GamePreview slug={game.slug} color={game.color} />
                    ) : (
                      <Gamepad2
                        className="h-8 w-8"
                        style={{ color: game.color }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-accent-primary transition-colors">
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
                </div>
              </TiltCard>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
