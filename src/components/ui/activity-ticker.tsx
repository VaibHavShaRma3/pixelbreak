"use client";

import { useEffect, useState } from "react";
import { Trophy, Zap } from "lucide-react";

const FAKE_ACTIVITIES = [
  { player: "NeonKnight", game: "Stack", score: 4200, time: "2m ago" },
  { player: "PixelQueen", game: "Color Match", score: 95, time: "5m ago" },
  { player: "ByteRunner", game: "Bubble Wrap", score: 312, time: "8m ago" },
  { player: "GlitchWiz", game: "Sudoku Lite", score: 47, time: "12m ago" },
  { player: "CyberFox", game: "Stack", score: 3800, time: "15m ago" },
  { player: "NeonPulse", game: "Color Match", score: 88, time: "20m ago" },
  { player: "VoidWalker", game: "Bubble Wrap", score: 500, time: "25m ago" },
  { player: "StarDust", game: "Stack", score: 5100, time: "30m ago" },
];

export function ActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % FAKE_ACTIVITIES.length);
        setIsVisible(true);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const activity = FAKE_ACTIVITIES[currentIndex];

  return (
    <div className="overflow-hidden border-b border-border bg-surface/50 backdrop-blur-sm">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-2 px-4">
        <Zap className="h-3 w-3 shrink-0 text-neon-yellow" />
        <div
          className="flex items-center gap-2 text-xs transition-all duration-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-10px)",
          }}
        >
          <span className="font-semibold text-neon-cyan">{activity.player}</span>
          <span className="text-muted">scored</span>
          <span className="font-bold text-neon-green">
            {activity.score.toLocaleString()}
          </span>
          <span className="text-muted">on</span>
          <span className="font-semibold text-neon-pink">{activity.game}</span>
          <Trophy className="h-3 w-3 text-neon-yellow" />
          <span className="text-muted/60">{activity.time}</span>
        </div>
      </div>
    </div>
  );
}
