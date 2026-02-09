import Link from "next/link";
import { Gamepad2, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-neon-cyan" />
            <span className="font-[family-name:var(--font-pixel)] text-xs text-muted">
              PixelBreak
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/games" className="hover:text-foreground transition-colors">
              Games
            </Link>
            <Link href="/leaderboards" className="hover:text-foreground transition-colors">
              Leaderboards
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/VaibHavShaRma3/pixelbreak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <span className="text-xs text-muted">
              &copy; {new Date().getFullYear()} PixelBreak
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
