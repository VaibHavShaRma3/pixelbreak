import { create } from "zustand";

type Phase = "rolling" | "scoring" | "roundEnd";

interface ScoringResult {
  score: number;
  category: string;
}

interface DiceTraderStore {
  dice: number[];
  locked: Set<number>;
  rollsLeft: number;
  round: number;
  totalRounds: number;
  roundScore: number;
  totalScore: number;
  phase: Phase;
  lastScoreReason: string;
  isRolling: boolean;
  rollDice: () => void;
  toggleLock: (index: number) => void;
  scoreTurn: () => void;
  nextRound: () => void;
  initGame: () => void;
  reset: () => void;
}

function rollSingleDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function getCounts(dice: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const d of dice) {
    counts.set(d, (counts.get(d) || 0) + 1);
  }
  return counts;
}

function calculateBestScore(dice: number[]): ScoringResult {
  const counts = getCounts(dice);
  const sorted = [...dice].sort((a, b) => a - b);
  const sum = dice.reduce((a, b) => a + b, 0);

  const countValues = [...counts.values()].sort((a, b) => b - a);
  const countEntries = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  // Five of a Kind (Yahtzee) - 100
  if (countValues[0] === 5) {
    return { score: 100, category: "Five of a Kind" };
  }

  // Four of a Kind - 70 + face * 4
  if (countValues[0] === 4) {
    const face = countEntries[0][0];
    return { score: 70 + face * 4, category: "Four of a Kind" };
  }

  // Large Straight (5 consecutive) - 60
  const sortedUnique = [...new Set(sorted)];
  if (sortedUnique.length === 5) {
    const isLargeStraight =
      sortedUnique[4] - sortedUnique[0] === 4;
    if (isLargeStraight) {
      return { score: 60, category: "Large Straight" };
    }
  }

  // Small Straight (4 consecutive) - 50
  const hasSmallStraight = checkSmallStraight(sorted);

  // Full House (3+2) - 40 + sum
  if (countValues[0] === 3 && countValues[1] === 2) {
    return { score: 40 + sum, category: "Full House" };
  }

  // Small Straight check (after full house, since full house scores higher typically)
  if (hasSmallStraight) {
    return { score: 50, category: "Small Straight" };
  }

  // Three of a Kind - 30 + face * 3
  if (countValues[0] === 3) {
    const face = countEntries[0][0];
    return { score: 30 + face * 3, category: "Three of a Kind" };
  }

  // Two Pairs - 20 + sum of pair face values * 2
  if (countValues[0] === 2 && countValues[1] === 2) {
    const pairFaces = countEntries
      .filter(([, count]) => count >= 2)
      .map(([face]) => face);
    const pairSum = pairFaces.reduce((a, b) => a + b, 0);
    return { score: 20 + pairSum * 2, category: "Two Pairs" };
  }

  // Pair - 10 + face * 2
  if (countValues[0] === 2) {
    const face = countEntries[0][0];
    return { score: 10 + face * 2, category: "Pair" };
  }

  // Nothing - sum of dice
  return { score: sum, category: "Nothing" };
}

function checkSmallStraight(sorted: number[]): boolean {
  const unique = [...new Set(sorted)];
  // Check for any 4 consecutive numbers in the unique values
  const straights = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];
  for (const straight of straights) {
    if (straight.every((v) => unique.includes(v))) {
      return true;
    }
  }
  return false;
}

export const useDiceTraderStore = create<DiceTraderStore>((set, get) => ({
  dice: [0, 0, 0, 0, 0],
  locked: new Set<number>(),
  rollsLeft: 2,
  round: 1,
  totalRounds: 10,
  roundScore: 0,
  totalScore: 0,
  phase: "rolling",
  lastScoreReason: "",
  isRolling: false,

  rollDice: () => {
    const { locked, rollsLeft, phase, isRolling } = get();
    if (rollsLeft <= 0 || phase !== "rolling" || isRolling) return;

    // Start rolling animation
    set({ isRolling: true });

    // Brief animation delay then settle
    setTimeout(() => {
      const currentDice = get().dice;
      const newDice = currentDice.map((val, i) =>
        locked.has(i) ? val : rollSingleDie()
      );

      set({
        dice: newDice,
        rollsLeft: get().rollsLeft - 1,
        isRolling: false,
      });
    }, 400);
  },

  toggleLock: (index: number) => {
    const { phase, dice, isRolling } = get();
    if (phase !== "rolling" || dice[index] === 0 || isRolling) return;

    const newLocked = new Set(get().locked);
    if (newLocked.has(index)) {
      newLocked.delete(index);
    } else {
      newLocked.add(index);
    }
    set({ locked: newLocked });
  },

  scoreTurn: () => {
    const { dice, phase, totalScore, isRolling } = get();
    if (phase !== "rolling" || dice.some((d) => d === 0) || isRolling) return;

    const result = calculateBestScore(dice);

    set({
      roundScore: result.score,
      totalScore: totalScore + result.score,
      lastScoreReason: `${result.category}! +${result.score}`,
      phase: "roundEnd",
    });
  },

  nextRound: () => {
    const { round, totalRounds } = get();
    if (round >= totalRounds) return;

    const newDice = Array.from({ length: 5 }, () => rollSingleDie());

    set({
      round: round + 1,
      dice: newDice,
      locked: new Set<number>(),
      rollsLeft: 2,
      roundScore: 0,
      phase: "rolling",
      lastScoreReason: "",
      isRolling: false,
    });
  },

  initGame: () => {
    const newDice = Array.from({ length: 5 }, () => rollSingleDie());

    set({
      dice: newDice,
      locked: new Set<number>(),
      rollsLeft: 2,
      round: 1,
      totalRounds: 10,
      roundScore: 0,
      totalScore: 0,
      phase: "rolling",
      lastScoreReason: "",
      isRolling: false,
    });
  },

  reset: () => {
    set({
      dice: [0, 0, 0, 0, 0],
      locked: new Set<number>(),
      rollsLeft: 2,
      round: 1,
      totalRounds: 10,
      roundScore: 0,
      totalScore: 0,
      phase: "rolling",
      lastScoreReason: "",
      isRolling: false,
    });
  },
}));
