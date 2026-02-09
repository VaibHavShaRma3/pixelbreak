"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SoundContextType {
  enabled: boolean;
  playClick: () => void;
  playHover: () => void;
  playSuccess: () => void;
  playGameOver: () => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  playClick: () => {},
  playHover: () => {},
  playSuccess: () => {},
  playGameOver: () => {},
});

export function useSound() {
  return useContext(SoundContext);
}

function createOscillator(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.1
) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  const playClick = useCallback(() => {
    if (!enabled) return;
    createOscillator(800, 0.05, "square", 0.05);
  }, [enabled]);

  const playHover = useCallback(() => {
    if (!enabled) return;
    createOscillator(600, 0.03, "sine", 0.03);
  }, [enabled]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    createOscillator(523, 0.1, "sine", 0.08);
    setTimeout(() => createOscillator(659, 0.1, "sine", 0.08), 100);
    setTimeout(() => createOscillator(784, 0.15, "sine", 0.08), 200);
  }, [enabled]);

  const playGameOver = useCallback(() => {
    if (!enabled) return;
    createOscillator(400, 0.15, "sawtooth", 0.06);
    setTimeout(() => createOscillator(300, 0.2, "sawtooth", 0.06), 150);
  }, [enabled]);

  return (
    <SoundContext.Provider
      value={{ enabled, playClick, playHover, playSuccess, playGameOver }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function SoundToggle() {
  const { enabled } = useSound();
  // We access the setter from the parent context — but since we're toggling
  // we need direct access. Let's use a simple approach:
  return <SoundToggleButton />;
}

function SoundToggleButton() {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      aria-label={enabled ? "Mute sounds" : "Enable sounds"}
      title={enabled ? "Mute sounds" : "Enable sounds"}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
    </button>
  );
}
