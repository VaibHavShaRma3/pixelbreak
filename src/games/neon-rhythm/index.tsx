"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useNeonRhythmStore, SONG_NAMES } from "./store";
import type { GameState, GameCallbacks } from "@/types/game";

interface NeonRhythmProps {
  gameState: GameState;
  score: number;
  setScore: (s: number | ((prev: number) => number)) => void;
  callbacks: GameCallbacks;
}

const LANE_COLORS = ["#00fff5", "#ff2d95", "#39ff14", "#ffe600"];
const LANE_KEYS = ["D", "F", "J", "K"];
const HIT_ZONE_Y = 85; // percentage from top
const NOTE_TRAVEL_TIME = 2000; // ms for a note to travel full screen
const PERFECT_WINDOW = 50; // ms
const GOOD_WINDOW = 100; // ms

export default function NeonRhythm({
  gameState,
  setScore,
  callbacks,
}: NeonRhythmProps) {
  const store = useNeonRhythmStore();
  const [feedback, setFeedback] = useState<{
    text: string;
    color: string;
    lane: number;
  } | null>(null);
  const [songPicking, setSongPicking] = useState(true);
  const frameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const notePositionsRef = useRef<Map<number, number>>(new Map());
  const [, forceRender] = useState(0);
  const songEndedRef = useRef(false);
  const scoreRef = useRef(0);

  // Keep scoreRef in sync
  useEffect(() => {
    scoreRef.current = store.score;
  }, [store.score]);

  // Reset on game start
  useEffect(() => {
    if (gameState === "playing") {
      store.reset();
      setScore(0);
      setSongPicking(true);
      songEndedRef.current = false;
    }
  }, [gameState, store.reset, setScore]);

  const startSong = useCallback(
    (index: number) => {
      store.loadSong(index);
      setSongPicking(false);
      // Slight delay before starting
      setTimeout(() => {
        store.setSongStartTime(performance.now());
        store.setPlaying(true);
      }, 500);
    },
    [store]
  );

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (!store.playing || gameState !== "playing") return;

    const loop = (timestamp: number) => {
      const elapsed = timestamp - store.songStartTime;
      const newPositions = new Map<number, number>();

      const notes = useNeonRhythmStore.getState().notes;
      let allProcessed = true;

      for (const note of notes) {
        if (note.hit || note.missed) continue;

        allProcessed = false;

        // Position: percentage from top (0% = top, HIT_ZONE_Y% = hit zone)
        const timeDiff = note.targetTime - elapsed;
        const position =
          HIT_ZONE_Y - (timeDiff / NOTE_TRAVEL_TIME) * HIT_ZONE_Y;
        newPositions.set(note.id, position);

        // Auto-miss if note passes well below hit zone
        if (position > HIT_ZONE_Y + 15) {
          store.missNote(note.id);
        }
      }

      notePositionsRef.current = newPositions;
      forceRender((n) => n + 1);

      // Check if song ended
      if (allProcessed || elapsed > store.songDuration + 3000) {
        if (!songEndedRef.current) {
          songEndedRef.current = true;
          const finalScore = useNeonRhythmStore.getState().score;
          setScore(finalScore);
          setTimeout(() => {
            callbacks.onGameEnd(finalScore);
          }, 500);
        }
        return;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [store.playing, gameState, store.songStartTime, store.songDuration, callbacks, setScore, store]);

  // Key handlers
  useEffect(() => {
    if (!store.playing || gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex === -1) return;

      e.preventDefault();

      const now = performance.now();
      const elapsed = now - store.songStartTime;
      const notes = useNeonRhythmStore.getState().notes;

      // Find closest unhit note in this lane
      let closest: { id: number; diff: number } | null = null;
      for (const note of notes) {
        if (note.lane !== laneIndex || note.hit || note.missed) continue;
        const diff = Math.abs(note.targetTime - elapsed);
        if (!closest || diff < closest.diff) {
          closest = { id: note.id, diff };
        }
      }

      if (closest && closest.diff <= GOOD_WINDOW) {
        const rating = closest.diff <= PERFECT_WINDOW ? "perfect" : "good";
        store.hitNote(closest.id, rating);

        const updatedScore = useNeonRhythmStore.getState().score;
        setScore(updatedScore);

        setFeedback({
          text: rating === "perfect" ? "PERFECT!" : "GOOD!",
          color: rating === "perfect" ? "#39ff14" : "#ffe600",
          lane: laneIndex,
        });
        setTimeout(() => setFeedback(null), 300);
      } else if (closest && closest.diff <= 200) {
        // Close but not close enough
        store.missNote(closest.id);
        setFeedback({
          text: "MISS!",
          color: "#ff2d95",
          lane: laneIndex,
        });
        setTimeout(() => setFeedback(null), 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store.playing, gameState, store.songStartTime, store, setScore]);

  // Song picker
  if (songPicking && gameState === "playing") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
        <h2 className="text-xl font-[family-name:var(--font-pixel)] text-neon-pink glow-pink">
          Choose a Song
        </h2>
        <p className="text-xs text-muted">
          Use keys D, F, J, K to hit notes
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {SONG_NAMES.map((name, i) => (
            <button
              key={i}
              onClick={() => startSong(i)}
              className="rounded-xl border border-border bg-surface-2 px-6 py-4 text-left transition-all hover:border-neon-pink/50 hover:bg-neon-pink/10 active:scale-95"
            >
              <div className="font-bold text-foreground">{name}</div>
              <div className="text-xs text-muted mt-1">
                {i === 0 ? "Easy - 35 notes" : i === 1 ? "Medium - 38 notes" : "Hard - 40 notes"}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #12121a 100%)" }}
    >
      {/* Lanes */}
      <div className="relative flex h-full" style={{ width: "280px" }}>
        {[0, 1, 2, 3].map((lane) => (
          <div
            key={lane}
            className="relative h-full border-x"
            style={{
              width: "70px",
              borderColor: `${LANE_COLORS[lane]}15`,
              background: `linear-gradient(180deg, transparent 0%, ${LANE_COLORS[lane]}05 100%)`,
            }}
          >
            {/* Lane label at bottom */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold font-mono opacity-60"
              style={{ color: LANE_COLORS[lane] }}
            >
              {LANE_KEYS[lane]}
            </div>
          </div>
        ))}

        {/* Hit zone line */}
        <div
          className="absolute left-0 right-0 h-1"
          style={{
            top: `${HIT_ZONE_Y}%`,
            background: `linear-gradient(90deg, ${LANE_COLORS[0]}, ${LANE_COLORS[1]}, ${LANE_COLORS[2]}, ${LANE_COLORS[3]})`,
            boxShadow: `0 0 12px rgba(255,255,255,0.3)`,
          }}
        />

        {/* Hit zone indicators */}
        {[0, 1, 2, 3].map((lane) => (
          <div
            key={`hit-${lane}`}
            className="absolute rounded-md"
            style={{
              left: `${lane * 70 + 10}px`,
              top: `${HIT_ZONE_Y - 2}%`,
              width: "50px",
              height: "16px",
              border: `2px solid ${LANE_COLORS[lane]}40`,
              background: `${LANE_COLORS[lane]}10`,
            }}
          />
        ))}

        {/* Notes */}
        {store.notes.map((note) => {
          if (note.hit || note.missed) return null;
          const pos = notePositionsRef.current.get(note.id);
          if (pos === undefined || pos < -5 || pos > 100) return null;

          return (
            <div
              key={note.id}
              className="absolute rounded-md"
              style={{
                left: `${note.lane * 70 + 10}px`,
                top: `${pos}%`,
                width: "50px",
                height: "16px",
                backgroundColor: LANE_COLORS[note.lane],
                boxShadow: `0 0 10px ${LANE_COLORS[note.lane]}80, 0 0 20px ${LANE_COLORS[note.lane]}40`,
                transform: "translateY(-50%)",
              }}
            />
          );
        })}

        {/* Feedback text */}
        {feedback && (
          <div
            className="absolute text-sm font-bold font-[family-name:var(--font-pixel)] pointer-events-none"
            style={{
              left: `${feedback.lane * 70 + 10}px`,
              top: `${HIT_ZONE_Y - 8}%`,
              color: feedback.color,
              textShadow: `0 0 10px ${feedback.color}`,
              width: "50px",
              textAlign: "center",
              fontSize: "10px",
            }}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Score & Combo overlay */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-2xl font-bold text-foreground">
          {store.score}
        </div>
        {store.combo > 1 && (
          <div
            className="text-sm font-bold mt-1"
            style={{
              color: store.combo >= 10 ? "#39ff14" : "#ffe600",
              textShadow:
                store.combo >= 10
                  ? "0 0 10px #39ff1480"
                  : "0 0 8px #ffe60060",
            }}
          >
            {store.combo}x COMBO
          </div>
        )}
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 text-left text-xs text-muted">
        <div>
          <span className="text-neon-green">{store.perfectCount}</span> Perfect
        </div>
        <div>
          <span className="text-neon-yellow">{store.goodCount}</span> Good
        </div>
        <div>
          <span className="text-neon-pink">{store.missCount}</span> Miss
        </div>
      </div>

      {/* Song name */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted">
        {SONG_NAMES[store.songIndex]}
      </div>
    </div>
  );
}
