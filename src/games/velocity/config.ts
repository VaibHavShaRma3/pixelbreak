import type { GameConfig } from "@/types/game";

export const velocityConfig: GameConfig = {
  slug: "velocity",
  title: "Velocity.js",
  description:
    "Race through neon-lit circuits at breakneck speed. Drift around corners, boost past opponents, and cross the finish line first!",
  category: "arcade",
  scoreType: "time",
  renderingMode: "canvas",
  thumbnail: "/games/velocity.png",
  color: "#00fff5",
  minPlayers: 1,
  maxPlayers: 1,
  estimatedPlayTime: "3-5 min",
  difficulty: "medium",
  tags: ["racing", "3d", "arcade", "drift"],
  howToPlay: [
    "W / Arrow Up = Accelerate, S / Arrow Down = Brake",
    "A / Arrow Left = Steer Left, D / Arrow Right = Steer Right",
    "Hold Space while turning to drift — release for a speed boost!",
    "Complete 3 laps around the neon track to finish",
    "Hit boost pads for a burst of speed, avoid barriers!",
    "Your score is your total race time — faster is better",
  ],
  enabled: true,
};
