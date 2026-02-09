"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useOneMinuteBaristaStore, INGREDIENTS, RECIPES } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface OneMinuteBaristaProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

export default function OneMinuteBarista({
  gameState,
  score,
  setScore,
  callbacks,
}: OneMinuteBaristaProps) {
  const store = useOneMinuteBaristaStore();
  const [serveFeedback, setServeFeedback] = useState<{
    text: string;
    color: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderGenRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
      setServeFeedback(null);
    }
  }, [gameState, store.reset, setScore]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      store.tickTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, store.tickTimer]);

  // Generate orders periodically
  useEffect(() => {
    if (gameState !== "playing") return;

    // Generate first orders immediately
    store.generateOrder();
    store.generateOrder();

    orderGenRef.current = setInterval(() => {
      store.generateOrder();
    }, 4000);

    return () => {
      if (orderGenRef.current) clearInterval(orderGenRef.current);
    };
  }, [gameState, store.generateOrder]);

  // Check timer end
  useEffect(() => {
    if (gameState === "playing" && store.timer <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (orderGenRef.current) clearInterval(orderGenRef.current);
      callbacks.onGameEnd(store.score);
    }
  }, [gameState, store.timer, store.score, callbacks]);

  // Keep score in sync
  useEffect(() => {
    setScore(store.score);
  }, [store.score, setScore]);

  const handleAddIngredient = useCallback(
    (ingredient: string) => {
      if (gameState !== "playing" || store.timer <= 0) return;
      store.addIngredient(ingredient);
    },
    [gameState, store.timer, store.addIngredient]
  );

  const handleServe = useCallback(() => {
    if (gameState !== "playing" || store.currentCup.length === 0) return;

    const result = store.serveDrink();

    if (result.success) {
      setServeFeedback({
        text: result.points > 10 ? `+${result.points} SPEED BONUS!` : `+${result.points}`,
        color: "#39ff14",
      });
    } else {
      setServeFeedback({
        text: "Wrong drink! -5",
        color: "#ff2d95",
      });
    }

    setTimeout(() => setServeFeedback(null), 1200);
  }, [gameState, store]);

  const handleDump = useCallback(() => {
    if (gameState !== "playing") return;
    store.clearCup();
  }, [gameState, store.clearCup]);

  const timerPercent = (store.timer / 60) * 100;
  const timerColor =
    store.timer > 30 ? "#39ff14" : store.timer > 15 ? "#ffe600" : "#ff2d95";

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      {/* Timer bar + Score */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted">
            Time:{" "}
            <span className="font-bold" style={{ color: timerColor }}>
              {store.timer}s
            </span>
          </span>
          <span className="text-sm text-muted">
            Score:{" "}
            <span className="font-bold text-neon-yellow">{store.score}</span>
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-surface-2 border border-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timerPercent}%`,
              backgroundColor: timerColor,
              boxShadow: `0 0 8px ${timerColor}60`,
            }}
          />
        </div>
      </div>

      {/* Orders */}
      <div className="w-full max-w-md">
        <div className="text-xs text-muted mb-2">Orders</div>
        <div className="flex gap-2">
          {store.orders.length === 0 ? (
            <div className="flex-1 rounded-lg border border-border bg-surface-2 p-3 text-center text-xs text-muted">
              Waiting for orders...
            </div>
          ) : (
            store.orders.map((order) => (
              <div
                key={order.id}
                className="flex-1 rounded-lg border border-border bg-surface-2 p-3"
                style={{
                  animation: "pulse 2s infinite",
                  borderColor:
                    Date.now() - order.createdAt > 8000
                      ? "#ff2d9560"
                      : "#2a2a3a",
                }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg">{order.recipe.emoji}</span>
                  <span className="text-xs font-bold text-foreground">
                    {order.recipe.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.recipe.ingredients.map((ing, i) => {
                    const ingConf = INGREDIENTS.find(
                      (item) => item.name === ing
                    );
                    return (
                      <span
                        key={i}
                        className="rounded-md px-1.5 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${ingConf?.color || "#666"}20`,
                          color: ingConf?.color || "#999",
                          border: `1px solid ${ingConf?.color || "#666"}30`,
                        }}
                      >
                        {ingConf?.emoji} {ing}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Your cup */}
      <div className="w-full max-w-md">
        <div className="text-xs text-muted mb-2">Your Cup</div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-3 min-h-[56px]">
          <span className="text-2xl">{"\u2615"}</span>
          <div className="flex flex-wrap gap-1 flex-1">
            {store.currentCup.length === 0 ? (
              <span className="text-xs text-muted">
                Add ingredients below...
              </span>
            ) : (
              store.currentCup.map((ing, i) => {
                const ingConf = INGREDIENTS.find(
                  (item) => item.name === ing
                );
                return (
                  <span
                    key={i}
                    className="rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${ingConf?.color || "#666"}25`,
                      color: ingConf?.color || "#999",
                      border: `1px solid ${ingConf?.color || "#666"}40`,
                    }}
                  >
                    {ingConf?.emoji} {ing}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Serve feedback */}
        {serveFeedback && (
          <div
            className="text-center text-sm font-bold mt-1 animate-bounce"
            style={{
              color: serveFeedback.color,
              textShadow: `0 0 8px ${serveFeedback.color}60`,
            }}
          >
            {serveFeedback.text}
          </div>
        )}
      </div>

      {/* Ingredient buttons */}
      <div className="w-full max-w-md">
        <div className="text-xs text-muted mb-2">Ingredients</div>
        <div className="grid grid-cols-3 gap-2">
          {INGREDIENTS.map((ing) => (
            <button
              key={ing.name}
              onClick={() => handleAddIngredient(ing.name)}
              disabled={gameState !== "playing" || store.timer <= 0}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: `${ing.color}30`,
              }}
            >
              <span className="text-lg">{ing.emoji}</span>
              <span className="text-xs capitalize text-foreground">
                {ing.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Serve and Dump buttons */}
      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={handleServe}
          disabled={
            gameState !== "playing" ||
            store.currentCup.length === 0 ||
            store.timer <= 0
          }
          className="flex-1 rounded-xl border-2 border-neon-green/50 bg-neon-green/10 px-4 py-3 text-sm font-bold text-neon-green transition-all hover:bg-neon-green/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            boxShadow: "0 0 12px rgba(57,255,20,0.15)",
          }}
        >
          Serve {"\ud83d\ude80"}
        </button>
        <button
          onClick={handleDump}
          disabled={
            gameState !== "playing" ||
            store.currentCup.length === 0 ||
            store.timer <= 0
          }
          className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-muted transition-all hover:border-neon-pink/30 hover:text-neon-pink active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Dump {"\ud83d\uddd1\ufe0f"}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted">
        <span>
          Served:{" "}
          <span className="text-neon-green">{store.ordersCompleted}</span>
        </span>
        <span>
          Failed:{" "}
          <span className="text-neon-pink">{store.ordersFailed}</span>
        </span>
      </div>
    </div>
  );
}
