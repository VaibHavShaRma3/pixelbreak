import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGameBySlug, gameRegistry } from "@/lib/game-registry";
import { GameLoader } from "@/components/game/game-loader";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";
import { ReviewPanel } from "@/components/reviews/review-panel";

export async function generateStaticParams() {
  return gameRegistry.filter((g) => g.enabled).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.description,
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getGameBySlug(slug);

  if (!config || !config.enabled) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/games"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-neon-cyan transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Games
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Game area */}
        <div>
          <GameLoader config={config} />
          {/* Reviews below the game */}
          <div className="mt-8">
            <ReviewPanel gameSlug={slug} />
          </div>
        </div>

        {/* Sidebar: Leaderboard */}
        <aside>
          <LeaderboardPanel gameSlug={slug} gameTitle={config.title} />
        </aside>
      </div>
    </div>
  );
}
