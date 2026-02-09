"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useGachaCapsuleStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface GachaCapsuleProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

type Rarity = "common" | "rare" | "epic" | "legendary";

interface GachaItem {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
}

const ITEMS: GachaItem[] = [
  // Common (50%)
  { id: "pixel-sword", name: "Pixel Sword", emoji: "\u2694\uFE0F", rarity: "common" },
  { id: "pixel-shield", name: "Pixel Shield", emoji: "\uD83D\uDEE1\uFE0F", rarity: "common" },
  { id: "red-potion", name: "Red Potion", emoji: "\uD83E\uDDEA", rarity: "common" },
  { id: "blue-gem", name: "Blue Gem", emoji: "\uD83D\uDC8E", rarity: "common" },
  { id: "iron-helmet", name: "Iron Helmet", emoji: "\u26D1\uFE0F", rarity: "common" },
  // Rare (30%)
  { id: "dragon-scale", name: "Dragon Scale", emoji: "\uD83D\uDC09", rarity: "rare" },
  { id: "magic-wand", name: "Magic Wand", emoji: "\uD83E\uDE84", rarity: "rare" },
  { id: "golden-key", name: "Golden Key", emoji: "\uD83D\uDD11", rarity: "rare" },
  { id: "crystal-ball", name: "Crystal Ball", emoji: "\uD83D\uDD2E", rarity: "rare" },
  { id: "thunder-bolt", name: "Thunder Bolt", emoji: "\u26A1", rarity: "rare" },
  // Epic (15%)
  { id: "phoenix-feather", name: "Phoenix Feather", emoji: "\uD83E\uDEB6", rarity: "epic" },
  { id: "dark-blade", name: "Dark Blade", emoji: "\uD83D\uDDE1\uFE0F", rarity: "epic" },
  { id: "rainbow-gem", name: "Rainbow Gem", emoji: "\uD83C\uDF08", rarity: "epic" },
  { id: "star-fragment", name: "Star Fragment", emoji: "\u2B50", rarity: "epic" },
  { id: "ancient-scroll", name: "Ancient Scroll", emoji: "\uD83D\uDCDC", rarity: "epic" },
  // Legendary (5%)
  { id: "infinity-stone", name: "Infinity Stone", emoji: "\uD83D\uDCAB", rarity: "legendary" },
  { id: "dragon-crown", name: "Dragon Crown", emoji: "\uD83D\uDC51", rarity: "legendary" },
  { id: "cosmic-egg", name: "Cosmic Egg", emoji: "\uD83E\uDD5A", rarity: "legendary" },
  { id: "world-seed", name: "World Seed", emoji: "\uD83C\uDF31", rarity: "legendary" },
  { id: "time-crystal", name: "Time Crystal", emoji: "\uD83D\uDD70\uFE0F", rarity: "legendary" },
];

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#888888",
  rare: "#00fff5",
  epic: "#ff2d95",
  legendary: "#ffe600",
};

const RARITY_BG: Record<Rarity, string> = {
  common: "rgba(136, 136, 136, 0.1)",
  rare: "rgba(0, 255, 245, 0.1)",
  epic: "rgba(255, 45, 149, 0.1)",
  legendary: "rgba(255, 230, 0, 0.15)",
};

function rollItem(): GachaItem {
  const roll = Math.random() * 100;
  let rarity: Rarity;
  if (roll < 50) rarity = "common";
  else if (roll < 80) rarity = "rare";
  else if (roll < 95) rarity = "epic";
  else rarity = "legendary";

  const rarityItems = ITEMS.filter((item) => item.rarity === rarity);
  return rarityItems[Math.floor(Math.random() * rarityItems.length)];
}

export default function GachaCapsule({
  gameState,
  score,
  setScore,
  callbacks,
}: GachaCapsuleProps) {
  const {
    coins,
    collection,
    totalPulls,
    currentAnimation,
    spendCoins,
    addCoins,
    addItem,
    incrementPulls,
    setAnimation,
    reset,
  } = useGachaCapsuleStore();

  const [revealedItem, setRevealedItem] = useState<GachaItem | null>(null);
  const [bonusCountdown, setBonusCountdown] = useState<number | null>(null);
  const [capsulePhase, setCapsulePhase] = useState<
    "idle" | "dropping" | "bouncing" | "opening" | "revealed"
  >("idle");

  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Calculate score
  const calculateScore = useCallback(() => {
    const uniqueItems = collection.size;
    let legendaryCount = 0;
    for (const [itemId] of collection) {
      const item = ITEMS.find((i) => i.id === itemId);
      if (item?.rarity === "legendary") legendaryCount++;
    }
    return uniqueItems * 10 + legendaryCount * 50;
  }, [collection]);

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      reset();
      setScore(0);
      setRevealedItem(null);
      setCapsulePhase("idle");
      setBonusCountdown(null);
    }
  }, [gameState, reset, setScore]);

  // Update score whenever collection changes
  useEffect(() => {
    if (gameState === "playing") {
      setScore(calculateScore());
    }
  }, [collection, gameState, calculateScore, setScore]);

  const handlePull = useCallback(() => {
    if (gameState !== "playing" || coins < 10 || currentAnimation) return;

    spendCoins(10);
    incrementPulls();
    setAnimation("pulling");
    setRevealedItem(null);

    // Phase 1: capsule drops
    setCapsulePhase("dropping");

    setTimeout(() => {
      // Phase 2: bounce
      setCapsulePhase("bouncing");

      setTimeout(() => {
        // Phase 3: opening
        setCapsulePhase("opening");

        setTimeout(() => {
          // Phase 4: reveal
          const item = rollItem();
          addItem(item.id);
          setRevealedItem(item);
          setCapsulePhase("revealed");
          setAnimation(null);

          setTimeout(() => {
            setCapsulePhase("idle");
          }, 2000);
        }, 400);
      }, 400);
    }, 500);
  }, [gameState, coins, currentAnimation, spendCoins, incrementPulls, setAnimation, addItem]);

  const handleBonusCoins = useCallback(() => {
    if (bonusCountdown !== null) return;
    setBonusCountdown(3);
    const interval = setInterval(() => {
      setBonusCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          addCoins(50);
          setBonusCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [bonusCountdown, addCoins]);

  const handleCashOut = useCallback(() => {
    callbacks.onGameEnd(scoreRef.current);
  }, [callbacks]);

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-text-secondary">Coins</p>
          <p className="text-2xl font-bold text-[#ffe600]">{coins}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">Pulls</p>
          <p className="text-2xl font-bold text-text-primary">{totalPulls}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">Score</p>
          <p className="text-2xl font-bold text-[#ff2d95]">{score}</p>
        </div>
      </div>

      {/* Capsule Machine */}
      <div className="relative flex flex-col items-center">
        {/* Machine body */}
        <div
          className="relative flex h-48 w-40 flex-col items-center justify-center rounded-2xl border-2"
          style={{
            borderColor: "#ff2d95",
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          }}
        >
          {/* Window */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2"
            style={{
              borderColor: "#ff2d95",
              background: "radial-gradient(circle, #1a1a2e, #0d0d1a)",
            }}
          >
            {capsulePhase === "idle" && !revealedItem && (
              <span className="text-3xl">?</span>
            )}
            {capsulePhase === "dropping" && (
              <div
                className="h-8 w-8 rounded-full"
                style={{
                  backgroundColor: "#ff2d95",
                  animation: "drop 0.5s ease-in",
                }}
              />
            )}
            {capsulePhase === "bouncing" && (
              <div
                className="h-8 w-8 rounded-full"
                style={{
                  backgroundColor: "#ff2d95",
                  animation: "bounce 0.4s ease-out",
                }}
              />
            )}
            {capsulePhase === "opening" && (
              <div
                className="h-8 w-8 rounded-full"
                style={{
                  backgroundColor: "#ffffff",
                  animation: "pulse 0.4s ease-in-out",
                }}
              />
            )}
            {capsulePhase === "revealed" && revealedItem && (
              <span className="text-3xl">{revealedItem.emoji}</span>
            )}
          </div>

          {/* Revealed item name */}
          {capsulePhase === "revealed" && revealedItem && (
            <div className="mt-2 text-center">
              <p
                className="text-xs font-bold"
                style={{
                  color: RARITY_COLORS[revealedItem.rarity],
                  textShadow: `0 0 10px ${RARITY_COLORS[revealedItem.rarity]}`,
                }}
              >
                {revealedItem.name}
              </p>
              <p
                className="text-[10px] uppercase"
                style={{ color: RARITY_COLORS[revealedItem.rarity] }}
              >
                {revealedItem.rarity}
              </p>
            </div>
          )}
        </div>

        {/* Machine base */}
        <div
          className="h-4 w-44 rounded-b-lg"
          style={{ backgroundColor: "#ff2d95", opacity: 0.6 }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePull}
          disabled={coins < 10 || currentAnimation !== null || gameState !== "playing"}
          className="rounded-lg border-2 px-6 py-2 text-sm font-bold transition-all disabled:opacity-30"
          style={{
            borderColor: "#ff2d95",
            backgroundColor: coins >= 10 ? "rgba(255, 45, 149, 0.15)" : "transparent",
            color: "#ff2d95",
          }}
        >
          Pull! (10 coins)
        </button>

        <button
          onClick={handleBonusCoins}
          disabled={bonusCountdown !== null || gameState !== "playing"}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-30"
          style={{
            borderColor: "#ffe600",
            color: "#ffe600",
            backgroundColor:
              bonusCountdown === null ? "rgba(255, 230, 0, 0.1)" : "transparent",
          }}
        >
          {bonusCountdown !== null
            ? `Wait ${bonusCountdown}s...`
            : "Bonus +50 coins"}
        </button>

        {gameState === "playing" && (
          <button
            onClick={handleCashOut}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all border-white/30 bg-white/5 text-white hover:bg-white/10"
          >
            Cash Out
          </button>
        )}
      </div>

      {/* Collection grid */}
      <div className="w-full max-w-lg">
        <p className="mb-2 text-center text-sm text-text-secondary">
          Collection ({collection.size} / {ITEMS.length})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ITEMS.map((item) => {
            const owned = collection.has(item.id);
            const count = collection.get(item.id) || 0;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center rounded-lg border p-2 text-center transition-all"
                style={{
                  borderColor: owned
                    ? RARITY_COLORS[item.rarity]
                    : "rgba(255,255,255,0.05)",
                  backgroundColor: owned
                    ? RARITY_BG[item.rarity]
                    : "rgba(0,0,0,0.2)",
                  opacity: owned ? 1 : 0.3,
                }}
              >
                <span className="text-xl">{owned ? item.emoji : "?"}</span>
                <span
                  className="mt-1 text-[10px] leading-tight"
                  style={{
                    color: owned ? RARITY_COLORS[item.rarity] : "#444",
                  }}
                >
                  {owned ? item.name : "???"}
                </span>
                {owned && (
                  <span className="text-[9px] text-text-secondary">
                    x{count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes drop {
          0% {
            transform: translateY(-40px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
