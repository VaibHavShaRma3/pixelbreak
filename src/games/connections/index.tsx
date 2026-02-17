"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useConnectionsStore } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface ConnectionsProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "#a78bfa", // purple
  2: "#4ade80", // green
  3: "#60a5fa", // blue
  4: "#fbbf24", // gold
};

export default function Connections({
  gameState,
  score,
  setScore,
  callbacks,
}: ConnectionsProps) {
  const store = useConnectionsStore();
  const hasInitRef = useRef(false);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const [shakingTiles, setShakingTiles] = useState(false);
  const [revealedGroups, setRevealedGroups] = useState<
    { category: string; words: string[]; color: string; difficulty: number }[]
  >([]);

  // Init puzzle when game starts playing
  useEffect(() => {
    if (gameState === "playing" && !hasInitRef.current) {
      hasInitRef.current = true;
      store.initPuzzle();
      setRevealedGroups([]);
    }
    if (gameState === "idle" || gameState === "gameover") {
      hasInitRef.current = false;
    }
  }, [gameState]);

  // Handle game over — reveal remaining groups
  useEffect(() => {
    if (store.gameOver && store.puzzle && gameState === "playing") {
      const foundCategories = store.foundGroups.map((g) => g.category);
      const remaining = store.puzzle.groups
        .filter((g) => !foundCategories.includes(g.category))
        .map((g) => ({
          category: g.category,
          words: g.words,
          color: g.color,
          difficulty: g.difficulty,
        }));
      setRevealedGroups(remaining);

      // Delay before calling onGameEnd so player can see remaining groups
      const timer = setTimeout(() => {
        callbacks.onGameEnd(scoreRef.current);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [store.gameOver, gameState, callbacks, store.puzzle, store.foundGroups]);

  // Handle win
  useEffect(() => {
    if (store.won && gameState === "playing") {
      // Bonus for winning
      setScore((prev: number) => prev + 200);

      const timer = setTimeout(() => {
        callbacks.onGameEnd(scoreRef.current + 200);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [store.won, gameState, callbacks, setScore]);

  // Clear shake animation
  useEffect(() => {
    if (store.shaking) {
      setShakingTiles(true);
      const timer = setTimeout(() => {
        setShakingTiles(false);
        store.clearShaking();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [store.shaking]);

  // Clear "one away" message
  useEffect(() => {
    if (store.oneAway) {
      const timer = setTimeout(() => {
        store.clearOneAway();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [store.oneAway]);

  const handleSubmit = useCallback(() => {
    if (store.selected.size !== 4) return;

    const result = store.submitGuess();

    if (result.correct && result.group) {
      const points = result.group.difficulty * 100;
      setScore((prev: number) => prev + points);
    }
  }, [store, setScore]);

  const remainingMistakes = store.maxMistakes - store.mistakes;
  const selectedArr = Array.from(store.selected);
  const foundWords = store.foundGroups.flatMap((g) => g.words);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-4 sm:p-8">
      {/* Title area */}
      <h2
        className="text-lg font-bold tracking-wide"
        style={{ color: "#CA8A04" }}
      >
        Create four groups of four!
      </h2>

      {/* Found groups */}
      <div className="flex w-full max-w-md flex-col gap-2">
        {store.foundGroups.map((group) => (
          <div
            key={group.category}
            className="flex flex-col items-center rounded-lg px-4 py-3 transition-all duration-500"
            style={{ backgroundColor: group.color + "22", borderLeft: `4px solid ${group.color}` }}
          >
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: group.color }}
            >
              {group.category}
            </span>
            <span className="text-xs text-muted mt-0.5">
              {group.words.join(", ")}
            </span>
          </div>
        ))}

        {/* Revealed groups on game over */}
        {revealedGroups.map((group) => (
          <div
            key={group.category}
            className="flex flex-col items-center rounded-lg px-4 py-3 opacity-60 transition-all duration-500"
            style={{ backgroundColor: group.color + "15", borderLeft: `4px solid ${group.color}` }}
          >
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: group.color }}
            >
              {group.category}
            </span>
            <span className="text-xs text-muted mt-0.5">
              {group.words.join(", ")}
            </span>
          </div>
        ))}
      </div>

      {/* Word grid — 4x4 */}
      {store.shuffledWords.length > 0 && (
        <div className="grid w-full max-w-md grid-cols-4 gap-2">
          {store.shuffledWords.map((word) => {
            const isSelected = store.selected.has(word);
            const isFound = foundWords.includes(word);

            return (
              <button
                key={word}
                disabled={isFound || store.gameOver || store.won}
                onClick={() => store.toggleWord(word)}
                className={`
                  flex h-14 items-center justify-center rounded-lg border-2 text-xs font-bold uppercase tracking-wide
                  transition-all duration-150 select-none
                  sm:h-16 sm:text-sm
                  ${shakingTiles && !isSelected ? "" : ""}
                  ${
                    isSelected
                      ? "border-[#CA8A04] bg-[#CA8A04]/20 text-[#CA8A04] scale-[0.96]"
                      : "border-border bg-surface hover:border-[#CA8A04]/50 hover:bg-surface-2 text-foreground"
                  }
                  ${isFound ? "opacity-30 cursor-default" : "cursor-pointer"}
                  ${shakingTiles && !isSelected ? "animate-[shake_0.5s_ease-in-out]" : ""}
                `}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* One away feedback */}
      {store.oneAway && (
        <div className="text-sm font-semibold" style={{ color: "#CA8A04" }}>
          One away!
        </div>
      )}

      {/* Mistakes remaining */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted mr-1">Mistakes remaining:</span>
        <div className="flex gap-1.5">
          {Array.from({ length: store.maxMistakes }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                i < remainingMistakes
                  ? "bg-[#CA8A04]"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => store.deselectAll()}
          disabled={store.selected.size === 0 || store.gameOver || store.won}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-all hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-default"
        >
          Deselect All
        </button>
        <button
          onClick={handleSubmit}
          disabled={store.selected.size !== 4 || store.gameOver || store.won}
          className="rounded-lg border-2 px-6 py-2 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-default"
          style={{
            borderColor: store.selected.size === 4 ? "#CA8A04" : undefined,
            color: store.selected.size === 4 ? "#CA8A04" : undefined,
            backgroundColor: store.selected.size === 4 ? "#CA8A0415" : undefined,
          }}
        >
          Submit
        </button>
      </div>

      {/* Score */}
      <div className="text-sm text-muted">
        Score: <span className="font-bold text-foreground">{score}</span>
      </div>

      {/* Win / Game Over messages */}
      {store.won && (
        <div className="text-center">
          <div
            className="text-xl font-bold"
            style={{ color: "#CA8A04" }}
          >
            Brilliant!
          </div>
          <div className="text-xs text-muted mt-1">+200 bonus points</div>
        </div>
      )}

      {store.gameOver && !store.won && (
        <div className="text-center">
          <div className="text-xl font-bold text-neon-pink">Game Over</div>
          <div className="text-xs text-muted mt-1">
            Better luck next time!
          </div>
        </div>
      )}

      {/* Difficulty legend */}
      <div className="flex gap-3 text-[10px] text-muted">
        {[1, 2, 3, 4].map((d) => (
          <div key={d} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: DIFFICULTY_COLORS[d] }}
            />
            <span>
              {d === 1 ? "Easy" : d === 2 ? "Medium" : d === 3 ? "Tricky" : "Hard"}
            </span>
          </div>
        ))}
      </div>

      {/* Shake keyframe — injected as inline style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
