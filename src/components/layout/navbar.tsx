"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, BookOpen, Trophy, User, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-border transition-all duration-300",
        scrolled
          ? "navbar-scrolled border-border/50 h-14"
          : "bg-background/90 backdrop-blur-sm h-16"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo with neon flicker */}
        <Link href="/" className="flex items-center gap-2 group">
          <Gamepad2 className="h-6 w-6 text-accent-pixel transition-transform group-hover:rotate-12 dark:animate-[neon-flicker_3s_infinite]" />
          <span className="font-[family-name:var(--font-pixel)] text-sm text-accent-pixel dark:drop-shadow-[0_0_8px_var(--accent-pixel)]">
            PixelBreak
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-surface-2 text-accent-primary font-medium dark:[text-shadow:0_0_10px_var(--accent-primary)]"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {/* Active indicator with neon glow */}
                {active && (
                  <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-8 -translate-x-1/2 bg-accent-primary rounded-full dark:shadow-[0_0_8px_var(--accent-primary),0_0_16px_var(--accent-primary)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <User className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu — dark glass background */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md dark:bg-[#0A0A0F]/90 dark:backdrop-blur-lg px-4 pb-4 md:hidden animate-fade-up">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border pt-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
