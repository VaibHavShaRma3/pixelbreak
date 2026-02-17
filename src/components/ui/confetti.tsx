"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    const colors = ["#00FFF5", "#FF2D95", "#39FF14", "#B026FF", "#FFE600"];

    // Center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2,
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        ticks: 200,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        ticks: 200,
      });
    }, 150);
  }, []);

  const fireStars = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 15,
      colors: ["#FF6B2D", "#00FFF5"],
      shapes: ["star"],
      origin: { y: 0.5 },
    });
  }, []);

  return { fireConfetti, fireStars };
}
