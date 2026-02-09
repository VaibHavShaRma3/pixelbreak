"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, BookOpen, Trophy, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-neon-cyan" />
          <span className="font-[family-name:var(--font-pixel)] text-sm text-neon-cyan glow-cyan">
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
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-2 text-neon-cyan"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
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
