import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-neon-pink" />
        <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan">
          Blog
        </h1>
      </div>
      <p className="mt-2 text-muted">
        Game updates, dev logs, and reviews.
      </p>

      <div className="mt-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <BookOpen className="h-12 w-12 text-muted" />
            <p className="text-muted">No posts yet. Check back soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
