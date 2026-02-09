"use client";

import { useVelocityStore } from "./store";

function formatLapTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 100);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function VelocityHUD() {
  const {
    speed,
    maxSpeed,
    lap,
    totalLaps,
    position,
    totalRacers,
    raceState,
    countdown,
    driftActive,
    driftCharge,
    bestLapTime,
    currentLapTime,
    totalRaceTime,
  } = useVelocityStore();

  if (raceState === "waiting") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Countdown overlay */}
      {raceState === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-[family-name:var(--font-pixel)] text-6xl font-bold animate-pulse"
            style={{
              color: countdown > 0 ? "#ffe600" : "#39ff14",
              textShadow: `0 0 30px ${countdown > 0 ? "#ffe600" : "#39ff14"}`,
            }}
          >
            {countdown > 0 ? countdown : "GO!"}
          </div>
        </div>
      )}

      {/* Top bar: Lap + Position + Timer */}
      {(raceState === "racing" || raceState === "finished") && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-6 rounded-lg bg-black/60 px-6 py-2 backdrop-blur-sm">
          {/* Position */}
          <div className="text-center">
            <div className="text-xs text-gray-400">POS</div>
            <div className="font-mono text-lg font-bold text-white">
              {ordinal(position)}
              <span className="text-xs text-gray-500"> / {totalRacers}</span>
            </div>
          </div>

          {/* Lap */}
          <div className="text-center">
            <div className="text-xs text-gray-400">LAP</div>
            <div className="font-mono text-lg font-bold text-[#00fff5]">
              {Math.min(lap, totalLaps)}/{totalLaps}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-xs text-gray-400">TIME</div>
            <div className="font-mono text-lg font-bold text-white">
              {formatLapTime(totalRaceTime)}
            </div>
          </div>

          {/* Best Lap */}
          {bestLapTime > 0 && (
            <div className="text-center">
              <div className="text-xs text-gray-400">BEST</div>
              <div className="font-mono text-sm font-bold text-[#39ff14]">
                {formatLapTime(bestLapTime)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom-right: Speedometer */}
      {(raceState === "racing" || raceState === "finished") && (
        <div className="absolute bottom-4 right-4">
          <SpeedGauge speed={speed} maxSpeed={maxSpeed} />
        </div>
      )}

      {/* Bottom-left: Drift meter */}
      {raceState === "racing" && driftActive && (
        <div className="absolute bottom-4 left-4 w-40">
          <div className="text-xs text-gray-400 mb-1">DRIFT</div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${driftCharge * 100}%`,
                backgroundColor: driftCharge > 0.5 ? "#39ff14" : "#ffe600",
                boxShadow:
                  driftCharge > 0.5
                    ? "0 0 10px #39ff14"
                    : "0 0 5px #ffe600",
              }}
            />
          </div>
          {driftCharge > 0.5 && (
            <div className="mt-1 text-center text-xs font-bold text-[#39ff14] animate-pulse">
              BOOST READY
            </div>
          )}
        </div>
      )}

      {/* Current lap time */}
      {raceState === "racing" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div className="text-xs text-gray-400">LAP TIME</div>
          <div className="font-mono text-sm font-bold text-white">
            {formatLapTime(currentLapTime)}
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedGauge({
  speed,
  maxSpeed,
}: {
  speed: number;
  maxSpeed: number;
}) {
  const fraction = Math.min(speed / maxSpeed, 1);
  const angle = -135 + fraction * 270; // -135deg to +135deg sweep
  const radius = 40;
  const cx = 50;
  const cy = 50;

  // Arc path
  const startAngle = (-135 * Math.PI) / 180;
  const endAngle = (angle * Math.PI) / 180;
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);
  const largeArc = fraction > 0.5 ? 1 : 0;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* Background arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#333"
          strokeWidth="6"
          strokeDasharray="213 70"
          strokeDashoffset="-35"
          strokeLinecap="round"
        />
        {/* Active arc */}
        {fraction > 0.01 && (
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke={fraction > 0.8 ? "#ff2d95" : "#00fff5"}
            strokeWidth="6"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${fraction > 0.8 ? "#ff2d95" : "#00fff5"})`,
            }}
          />
        )}
        {/* Speed text */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {Math.round(speed)}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="#666"
          fontSize="7"
          fontFamily="monospace"
        >
          KM/H
        </text>
      </svg>
    </div>
  );
}
