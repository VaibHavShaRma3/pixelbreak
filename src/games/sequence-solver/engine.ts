// Sequence Solver — pure game logic
// Generates number sequences of varying difficulty and validates answers.

export interface Sequence {
  numbers: number[];
  answer: number;
  hint: string;
  difficulty: number; // 1-3
  points: number;
}

type SequenceGenerator = () => Sequence;

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ────────────────────────────────────────────────────────────
// Easy generators  (difficulty 1, 50 pts)
// ────────────────────────────────────────────────────────────

/** Arithmetic sequence: start, start+d, start+2d, ... */
function arithmeticSequence(): Sequence {
  const d = randInt(2, 9);
  const start = randInt(1, 20);
  const count = randInt(5, 6);
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) numbers.push(start + d * i);
  const answer = start + d * count;
  return {
    numbers,
    answer,
    hint: `Each number increases by a constant.`,
    difficulty: 1,
    points: 50,
  };
}

/** Doubling sequence: start, start*2, start*4, ... */
function doublingSequence(): Sequence {
  const start = randInt(1, 5);
  const count = randInt(5, 6);
  const numbers: number[] = [];
  let val = start;
  for (let i = 0; i < count; i++) {
    numbers.push(val);
    val *= 2;
  }
  const answer = val;
  return {
    numbers,
    answer,
    hint: `Each number is doubled.`,
    difficulty: 1,
    points: 50,
  };
}

/** Simple counting-by pattern: +3, +5, +10, etc. */
function countingBySequence(): Sequence {
  const step = pick([3, 4, 5, 7, 10, 11]);
  const start = randInt(0, 10);
  const count = randInt(5, 6);
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) numbers.push(start + step * i);
  const answer = start + step * count;
  return {
    numbers,
    answer,
    hint: `Count by the same amount each time.`,
    difficulty: 1,
    points: 50,
  };
}

/** Descending arithmetic: starts high, subtracts constant */
function descendingArithmeticSequence(): Sequence {
  const d = randInt(2, 8);
  const start = randInt(50, 100);
  const count = randInt(5, 6);
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) numbers.push(start - d * i);
  const answer = start - d * count;
  return {
    numbers,
    answer,
    hint: `Each number decreases by a constant.`,
    difficulty: 1,
    points: 50,
  };
}

// ────────────────────────────────────────────────────────────
// Medium generators  (difficulty 2, 100 pts)
// ────────────────────────────────────────────────────────────

/** Geometric sequence: start, start*r, start*r^2, ... */
function geometricSequence(): Sequence {
  const r = pick([3, 4, 5]);
  const start = randInt(1, 3);
  const count = 5;
  const numbers: number[] = [];
  let val = start;
  for (let i = 0; i < count; i++) {
    numbers.push(val);
    val *= r;
  }
  const answer = val;
  return {
    numbers,
    answer,
    hint: `Each number is multiplied by the same factor.`,
    difficulty: 2,
    points: 100,
  };
}

/** Fibonacci-like: a, b, a+b, b+(a+b), ... */
function fibonacciLikeSequence(): Sequence {
  const a = randInt(1, 3);
  const b = randInt(1, 3);
  const nums = [a, b];
  const count = 5;
  while (nums.length < count) {
    nums.push(nums[nums.length - 1] + nums[nums.length - 2]);
  }
  const answer = nums[nums.length - 1] + nums[nums.length - 2];
  return {
    numbers: nums,
    answer,
    hint: `Each number is the sum of the two before it.`,
    difficulty: 2,
    points: 100,
  };
}

/** Square numbers: 1, 4, 9, 16, 25 ... */
function squareNumbersSequence(): Sequence {
  const offset = randInt(0, 3);
  const count = 5;
  const numbers: number[] = [];
  for (let i = 1; i <= count; i++) numbers.push((i + offset) ** 2);
  const answer = (count + 1 + offset) ** 2;
  return {
    numbers,
    answer,
    hint: `Think about perfect squares.`,
    difficulty: 2,
    points: 100,
  };
}

/** Alternating operations: +a, *b, +a, *b, ... */
function alternatingOpsSequence(): Sequence {
  const addVal = randInt(1, 5);
  const mulVal = pick([2, 3]);
  let val = randInt(1, 5);
  const count = 6;
  const numbers: number[] = [val];

  for (let i = 1; i < count; i++) {
    if (i % 2 === 1) {
      val += addVal;
    } else {
      val *= mulVal;
    }
    numbers.push(val);
  }

  // Next operation
  if (count % 2 === 1) {
    val += addVal;
  } else {
    val *= mulVal;
  }
  const answer = val;

  return {
    numbers,
    answer,
    hint: `The pattern alternates between two operations.`,
    difficulty: 2,
    points: 100,
  };
}

/** Cube numbers: 1, 8, 27, 64, 125 ... */
function cubeNumbersSequence(): Sequence {
  const offset = randInt(0, 1);
  const count = 5;
  const numbers: number[] = [];
  for (let i = 1; i <= count; i++) numbers.push((i + offset) ** 3);
  const answer = (count + 1 + offset) ** 3;
  return {
    numbers,
    answer,
    hint: `Think about perfect cubes.`,
    difficulty: 2,
    points: 100,
  };
}

// ────────────────────────────────────────────────────────────
// Hard generators  (difficulty 3, 200 pts)
// ────────────────────────────────────────────────────────────

/** Triangular numbers: 1, 3, 6, 10, 15, ... */
function triangularSequence(): Sequence {
  const offset = randInt(0, 2);
  const count = 5;
  const numbers: number[] = [];
  for (let i = 1; i <= count; i++) {
    const n = i + offset;
    numbers.push((n * (n + 1)) / 2);
  }
  const nNext = count + 1 + offset;
  const answer = (nNext * (nNext + 1)) / 2;
  return {
    numbers,
    answer,
    hint: `Each difference increases by one.`,
    difficulty: 3,
    points: 200,
  };
}

/** Prime numbers (starting from random offset) */
function primeSequence(): Sequence {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const startIdx = randInt(0, 4);
  const count = 5;
  const numbers = primes.slice(startIdx, startIdx + count);
  const answer = primes[startIdx + count];
  return {
    numbers,
    answer,
    hint: `These are a special set of indivisible numbers.`,
    difficulty: 3,
    points: 200,
  };
}

/** Compound pattern: differences themselves form an arithmetic sequence */
function compoundPatternSequence(): Sequence {
  const startDiff = randInt(1, 4);
  const diffStep = randInt(1, 3);
  const start = randInt(1, 10);
  const count = 6;
  const numbers: number[] = [start];
  let diff = startDiff;

  for (let i = 1; i < count; i++) {
    numbers.push(numbers[i - 1] + diff);
    diff += diffStep;
  }
  const answer = numbers[count - 1] + diff;
  return {
    numbers,
    answer,
    hint: `The differences between numbers follow their own pattern.`,
    difficulty: 3,
    points: 200,
  };
}

/** Powers of a number: n^1, n^2, n^3, n^4, ... */
function powerSequence(): Sequence {
  const base = pick([2, 3]);
  const startExp = randInt(1, 2);
  const count = 5;
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) numbers.push(base ** (startExp + i));
  const answer = base ** (startExp + count);
  return {
    numbers,
    answer,
    hint: `Each number is a power of the same base.`,
    difficulty: 3,
    points: 200,
  };
}

/** Interleaved sequences: two independent patterns mixed */
function interleavedSequence(): Sequence {
  // Pattern A: arithmetic at even indices
  const startA = randInt(1, 5);
  const stepA = randInt(2, 5);
  // Pattern B: arithmetic at odd indices
  const startB = randInt(10, 20);
  const stepB = randInt(3, 6);

  const count = 6;
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      numbers.push(startA + stepA * (i / 2));
    } else {
      numbers.push(startB + stepB * Math.floor(i / 2));
    }
  }

  // Next number is at index 6 (even), so pattern A
  const answer = startA + stepA * (count / 2);
  return {
    numbers,
    answer,
    hint: `Two separate patterns are interleaved.`,
    difficulty: 3,
    points: 200,
  };
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

const easyGenerators: SequenceGenerator[] = [
  arithmeticSequence,
  doublingSequence,
  countingBySequence,
  descendingArithmeticSequence,
];

const mediumGenerators: SequenceGenerator[] = [
  geometricSequence,
  fibonacciLikeSequence,
  squareNumbersSequence,
  alternatingOpsSequence,
  cubeNumbersSequence,
];

const hardGenerators: SequenceGenerator[] = [
  triangularSequence,
  primeSequence,
  compoundPatternSequence,
  powerSequence,
  interleavedSequence,
];

export function generateSequence(difficulty: number): Sequence {
  let generators: SequenceGenerator[];
  switch (difficulty) {
    case 1:
      generators = easyGenerators;
      break;
    case 2:
      generators = mediumGenerators;
      break;
    case 3:
      generators = hardGenerators;
      break;
    default:
      generators = easyGenerators;
  }
  return pick(generators)();
}

export function checkAnswer(sequence: Sequence, answer: number): boolean {
  return answer === sequence.answer;
}
