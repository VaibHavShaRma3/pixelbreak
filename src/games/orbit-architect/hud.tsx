"use client";

import { useOrbitStore } from "./store";

export function OrbitHUD({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  const {
    phase,
    planetCount,
    maxPlanets,
    simTime,
    alivePlanets,
    score,
  } = useOrbitStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* ---- Top bar ---- */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-5 rounded-lg bg-black/60 px-5 py-2 backdrop-blur-sm">
        {/* Phase badge */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">
            Phase
          </div>
          <div
            className="font-mono text-sm font-bold"
            style={{
              color:
                phase === "placing"
                  ? "#00fff5"
                  : phase === "simulating"
                    ? "#ffe600"
                    : "#39ff14",
            }}
          >
            {phase === "placing"
              ? "Placing"
              : phase === "simulating"
                ? "Simulating"
                : "Done"}
          </div>
        </div>

        {/* Planet counter */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">
            Planets
          </div>
          <div className="font-mono text-sm font-bold text-white">
            {planetCount}/{maxPlanets}
          </div>
        </div>

        {/* Timer (simulating only) */}
        {phase === "simulating" && (
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-gray-500">
              Time
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {simTime.toFixed(1)}s / 30s
            </div>
          </div>
        )}

        {/* Alive count (simulating) */}
        {phase === "simulating" && (
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-gray-500">
              Alive
            </div>
            <div className="font-mono text-sm font-bold text-[#39ff14]">
              {alivePlanets}
            </div>
          </div>
        )}
      </div>

      {/* ---- Launch button (placing phase) ---- */}
      {phase === "placing" && planetCount > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onLaunch}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: "0 0 20px rgba(0, 255, 245, 0.3)",
            }}
          >
            Launch Simulation
          </button>
        </div>
      )}

      {/* ---- Placing hint ---- */}
      {phase === "placing" && planetCount === 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="rounded-lg bg-black/50 px-5 py-2 text-center font-mono text-xs text-gray-400 backdrop-blur-sm">
            Click to place a planet, drag to set its velocity
          </div>
        </div>
      )}

      {/* ---- Placing hint when planets exist ---- */}
      {phase === "placing" && planetCount > 0 && planetCount < maxPlanets && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="rounded-lg bg-black/40 px-4 py-1.5 text-center font-mono text-[11px] text-gray-500 backdrop-blur-sm">
            Place more planets or launch the simulation
          </div>
        </div>
      )}

      {/* ---- Score overlay (done phase) ---- */}
      {phase === "done" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-black/80 px-10 py-8 text-center backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-widest text-gray-400">
              Final Score
            </div>
            <div
              className="mt-2 font-mono text-5xl font-bold"
              style={{
                color: "#00fff5",
                textShadow: "0 0 24px rgba(0,255,245,0.5)",
              }}
            >
              {score}
            </div>
            <div className="mt-3 font-mono text-xs text-gray-500">
              {alivePlanets} planet{alivePlanets !== 1 ? "s" : ""} survived
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
