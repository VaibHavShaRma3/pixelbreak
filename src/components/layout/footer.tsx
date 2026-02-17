import Link from "next/link";
import { Gamepad2, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2 dark:border-accent-primary/10 dark:shadow-[0_-1px_20px_rgba(0,255,245,0.05)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-accent-pixel" />
            <span className="font-[family-name:var(--font-pixel)] text-xs text-muted">
              PixelBreak
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/games" className="hover:text-accent-primary transition-colors dark:hover:[text-shadow:0_0_8px_var(--accent-primary)]">
              Games
            </Link>
            <Link href="/leaderboards" className="hover:text-accent-primary transition-colors dark:hover:[text-shadow:0_0_8px_var(--accent-primary)]">
              Leaderboards
            </Link>
            <Link href="/blog" className="hover:text-accent-primary transition-colors dark:hover:[text-shadow:0_0_8px_var(--accent-primary)]">
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/VaibHavShaRma3/pixelbreak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent-primary transition-colors"
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
