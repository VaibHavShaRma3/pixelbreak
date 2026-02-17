import { create } from "zustand";

type Phase = "pick" | "revealed" | "result";

interface MontyHallStore {
  phase: Phase;
  prizeDoor: number; // 0, 1, or 2
  playerPick: number | null;
  revealedDoor: number | null;
  finalChoice: number | null;
  round: number;
  totalRounds: number;
  wins: number;
  switchWins: number;
  stickWins: number;
  switchCount: number;
  stickCount: number;
  history: { switched: boolean; won: boolean }[];
  pickDoor: (door: number) => void;
  makeChoice: (action: "stick" | "switch") => void;
  nextRound: () => void;
  reset: () => void;
}

function randomDoor(): number {
  return Math.floor(Math.random() * 3);
}

export const useMontyHallStore = create<MontyHallStore>((set, get) => ({
  phase: "pick",
  prizeDoor: randomDoor(),
  playerPick: null,
  revealedDoor: null,
  finalChoice: null,
  round: 1,
  totalRounds: 20,
  wins: 0,
  switchWins: 0,
  stickWins: 0,
  switchCount: 0,
  stickCount: 0,
  history: [],

  pickDoor: (door: number) => {
    const { prizeDoor } = get();

    // Find a door to reveal: must not be the player's pick and must not be the prize door
    const candidates = [0, 1, 2].filter(
      (d) => d !== door && d !== prizeDoor
    );
    const revealedDoor =
      candidates[Math.floor(Math.random() * candidates.length)];

    set({
      playerPick: door,
      revealedDoor,
      phase: "revealed",
    });
  },

  makeChoice: (action: "stick" | "switch") => {
    const { playerPick, revealedDoor, prizeDoor, wins, switchWins, stickWins, switchCount, stickCount, history } =
      get();

    if (playerPick === null || revealedDoor === null) return;

    let finalChoice: number;
    const switched = action === "switch";

    if (switched) {
      // Switch to the other unopened door (not playerPick, not revealedDoor)
      finalChoice = [0, 1, 2].filter(
        (d) => d !== playerPick && d !== revealedDoor
      )[0];
    } else {
      finalChoice = playerPick;
    }

    const won = finalChoice === prizeDoor;

    set({
      finalChoice,
      phase: "result",
      wins: won ? wins + 1 : wins,
      switchWins: switched && won ? switchWins + 1 : switchWins,
      stickWins: !switched && won ? stickWins + 1 : stickWins,
      switchCount: switched ? switchCount + 1 : switchCount,
      stickCount: !switched ? stickCount + 1 : stickCount,
      history: [...history, { switched, won }],
    });
  },

  nextRound: () => {
    const { round } = get();
    set({
      phase: "pick",
      prizeDoor: randomDoor(),
      playerPick: null,
      revealedDoor: null,
      finalChoice: null,
      round: round + 1,
    });
  },

  reset: () =>
    set({
      phase: "pick",
      prizeDoor: randomDoor(),
      playerPick: null,
      revealedDoor: null,
      finalChoice: null,
      round: 1,
      wins: 0,
      switchWins: 0,
      stickWins: 0,
      switchCount: 0,
      stickCount: 0,
      history: [],
    }),
}));
