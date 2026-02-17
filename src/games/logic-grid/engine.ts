// Logic Grid Puzzle engine — 3 categories × 3 items, pre-built puzzle bank

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Category {
  name: string;
  items: [string, string, string];
}

export interface Clue {
  text: string;
}

export interface PuzzleDefinition {
  categories: [Category, Category, Category];
  clues: Clue[];
  /** solution[catA][itemA] = itemB index in catB (for each pair) */
  solution: SolutionMap;
}

/** Maps sub-grid key "0-1" -> 3×3 boolean grid (true = match) */
export type SolutionMap = Record<string, boolean[][]>;

/** "yes" | "no" | null (empty) */
export type CellMark = "yes" | "no" | null;

/** Maps sub-grid key -> 3×3 mark grid */
export type GridState = Record<string, CellMark[][]>;

// ---------------------------------------------------------------------------
// Sub-grid key helper
// ---------------------------------------------------------------------------

export function subGridKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

// ---------------------------------------------------------------------------
// Create empty grid state for 3 categories
// ---------------------------------------------------------------------------

export function createEmptyGrid(): GridState {
  const grid: GridState = {};
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      grid[subGridKey(a, b)] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];
    }
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Build solution map from a mapping array
// ---------------------------------------------------------------------------

function buildSolution(
  /** mapping[catIndex][itemIndex] = itemIndex in cat0 that it maps to */
  map01: [number, number, number],
  map02: [number, number, number]
): SolutionMap {
  const sol: SolutionMap = {};

  // 0-1 sub-grid: map01[i] = which item in cat1 matches cat0 item i
  sol["0-1"] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => map01[r] === c)
  );

  // 0-2 sub-grid
  sol["0-2"] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => map02[r] === c)
  );

  // 1-2 sub-grid: derived — if cat0[i]↔cat1[map01[i]] and cat0[i]↔cat2[map02[i]]
  // then cat1[map01[i]]↔cat2[map02[i]]
  sol["1-2"] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => {
      // row r = cat1 item r, col c = cat2 item c
      // find which cat0 item maps to cat1 item r
      const cat0Item = map01.indexOf(r);
      if (cat0Item === -1) return false;
      return map02[cat0Item] === c;
    })
  );

  return sol;
}

// ---------------------------------------------------------------------------
// Puzzle bank — 8 hand-crafted puzzles
// ---------------------------------------------------------------------------

const puzzleBank: PuzzleDefinition[] = [
  // Puzzle 1: Pets
  {
    categories: [
      { name: "Owner", items: ["Alice", "Bob", "Carol"] },
      { name: "Pet", items: ["Cat", "Dog", "Fish"] },
      { name: "Color", items: ["Red", "Blue", "Green"] },
    ],
    clues: [
      { text: "Alice owns the cat." },
      { text: "The dog owner likes blue." },
      { text: "Carol's favorite color is green." },
      { text: "Bob does not own the fish." },
      { text: "The cat owner's favorite color is red." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
    // Alice→Cat→Red, Bob→Dog→Blue, Carol→Fish→Green
  },

  // Puzzle 2: Breakfast
  {
    categories: [
      { name: "Person", items: ["Dan", "Eve", "Frank"] },
      { name: "Drink", items: ["Coffee", "Tea", "Juice"] },
      { name: "Food", items: ["Toast", "Eggs", "Cereal"] },
    ],
    clues: [
      { text: "Eve drinks tea." },
      { text: "The coffee drinker eats toast." },
      { text: "Frank does not eat cereal." },
      { text: "Dan does not drink juice." },
      { text: "The juice drinker eats cereal." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
    // Dan→Coffee→Toast, Eve→Tea→Eggs, Frank→Juice→Cereal
    // Wait — clue 3 says Frank does not eat cereal but solution has Frank→Cereal.
    // Let me fix: Dan→Coffee→Toast, Eve→Tea→Cereal, Frank→Juice→Eggs
    // map01: Dan→Coffee(0), Eve→Tea(1), Frank→Juice(2) = [0,1,2]
    // map02: Dan→Toast(0), Eve→Cereal(2), Frank→Eggs(1) = [0,2,1]
  },

  // Puzzle 3: Sports
  {
    categories: [
      { name: "Athlete", items: ["Grace", "Henry", "Iris"] },
      { name: "Sport", items: ["Tennis", "Soccer", "Swimming"] },
      { name: "Day", items: ["Monday", "Wednesday", "Friday"] },
    ],
    clues: [
      { text: "Grace plays tennis." },
      { text: "The soccer player practices on Wednesday." },
      { text: "Iris practices on Friday." },
      { text: "Henry does not swim." },
      { text: "Grace practices on Monday." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
    // Grace→Tennis→Monday, Henry→Soccer→Wednesday, Iris→Swimming→Friday
  },

  // Puzzle 4: Music
  {
    categories: [
      { name: "Musician", items: ["Kim", "Leo", "Mia"] },
      { name: "Instrument", items: ["Piano", "Guitar", "Drums"] },
      { name: "Genre", items: ["Jazz", "Rock", "Classical"] },
    ],
    clues: [
      { text: "Leo plays guitar." },
      { text: "The pianist plays classical music." },
      { text: "Kim does not play drums." },
      { text: "Mia plays rock music." },
      { text: "The drummer does not play jazz." },
    ],
    solution: buildSolution([0, 1, 2], [2, 0, 1]),
    // Kim→Piano→Classical, Leo→Guitar→Jazz, Mia→Drums→Rock
  },

  // Puzzle 5: Vacation
  {
    categories: [
      { name: "Traveler", items: ["Nina", "Oscar", "Pat"] },
      { name: "Destination", items: ["Paris", "Tokyo", "Cairo"] },
      { name: "Month", items: ["March", "June", "September"] },
    ],
    clues: [
      { text: "Oscar travels in June." },
      { text: "The person going to Paris travels in March." },
      { text: "Pat is going to Cairo." },
      { text: "Nina is not going to Tokyo." },
      { text: "The Tokyo trip is in June." },
    ],
    solution: buildSolution([0, 2, 1], [0, 1, 2]),
    // Nina→Paris→March, Oscar→Cairo→June... wait let me re-check
    // Clue 5: Tokyo in June. Clue 1: Oscar in June → Oscar→Tokyo
    // Clue 3: Pat→Cairo. Clue 4: Nina not Tokyo → Nina→Paris
    // Clue 2: Paris in March → Nina in March
    // Oscar→June, Nina→March → Pat→September
    // Nina→Paris→March, Oscar→Tokyo→June, Pat→Cairo→September
    // map01: Nina→Paris(0), Oscar→Tokyo(1), Pat→Cairo(2) = [0,1,2]
    // map02: Nina→March(0), Oscar→June(1), Pat→September(2) = [0,1,2]
  },

  // Puzzle 6: Baking
  {
    categories: [
      { name: "Baker", items: ["Quinn", "Rosa", "Sam"] },
      { name: "Pastry", items: ["Cake", "Pie", "Cookies"] },
      { name: "Flavor", items: ["Chocolate", "Vanilla", "Lemon"] },
    ],
    clues: [
      { text: "Rosa bakes pie." },
      { text: "The cake baker uses chocolate." },
      { text: "Sam does not use lemon." },
      { text: "Quinn does not bake cookies." },
      { text: "The cookie baker uses lemon." },
    ],
    solution: buildSolution([0, 1, 2], [0, 2, 1]),
    // Quinn→Cake→Chocolate, Rosa→Pie→Lemon... wait
    // Clue 4: Quinn not cookies. Clue 2: cake→chocolate.
    // Clue 1: Rosa→Pie. So Quinn→Cake or Cookies. Clue 4: not cookies → Quinn→Cake
    // → Sam→Cookies. Clue 5: cookies→lemon → Sam→Lemon.
    // Clue 3: Sam not lemon — CONTRADICTION. Let me fix.
    // Quinn→Cake→Chocolate, Rosa→Pie→Vanilla, Sam→Cookies→Lemon
    // Clue 3 says Sam does not use lemon. Conflict. Fix clue 3:
    // Let's change: Sam→Cookies→Lemon, Rosa→Pie→Vanilla, Quinn→Cake→Chocolate
    // Change clue 3 to "Rosa uses vanilla."
  },

  // Puzzle 7: School
  {
    categories: [
      { name: "Student", items: ["Tara", "Uma", "Vic"] },
      { name: "Subject", items: ["Math", "Science", "Art"] },
      { name: "Grade", items: ["A", "B", "C"] },
    ],
    clues: [
      { text: "Uma studies science." },
      { text: "The math student got an A." },
      { text: "Vic did not get a C." },
      { text: "Tara does not study art." },
      { text: "The art student got a C." },
    ],
    solution: buildSolution([0, 1, 2], [0, 2, 1]),
    // Tara→Math→A, Uma→Science→C... let me check
    // Clue 4: Tara not art. Clue 1: Uma→Science. → Tara→Math or Art → Tara→Math
    // → Vic→Art. Clue 2: math→A → Tara→A. Clue 5: art→C → Vic→C.
    // Clue 3: Vic not C — CONTRADICTION. Fix:
    // Swap: Tara→Math→A, Uma→Science→B, Vic→Art→C
    // Clue 3 should be "Uma did not get a C" instead
  },

  // Puzzle 8: Garden
  {
    categories: [
      { name: "Gardener", items: ["Wendy", "Xander", "Yuki"] },
      { name: "Flower", items: ["Rose", "Tulip", "Daisy"] },
      { name: "Tool", items: ["Shovel", "Rake", "Hose"] },
    ],
    clues: [
      { text: "Xander grows tulips." },
      { text: "The rose grower uses a shovel." },
      { text: "Yuki does not use a rake." },
      { text: "Wendy does not grow daisies." },
      { text: "The daisy grower uses a rake." },
    ],
    solution: buildSolution([0, 1, 2], [0, 2, 1]),
    // Clue 4: Wendy not daisy. Clue 1: Xander→Tulip → Wendy→Rose or Daisy → Wendy→Rose
    // → Yuki→Daisy. Clue 2: rose→shovel → Wendy→Shovel.
    // Clue 5: daisy→rake → Yuki→Rake. Clue 3: Yuki not rake — CONTRADICTION.
    // Fix clue 3: "Xander does not use a hose."
  },
];

// ---------------------------------------------------------------------------
// Fix puzzles — rebuild with correct solutions & clues
// ---------------------------------------------------------------------------

// I'll define each puzzle cleanly with verified solutions.

const verifiedPuzzles: PuzzleDefinition[] = [
  // 1: Pets — Alice→Cat→Red, Bob→Dog→Blue, Carol→Fish→Green
  {
    categories: [
      { name: "Owner", items: ["Alice", "Bob", "Carol"] },
      { name: "Pet", items: ["Cat", "Dog", "Fish"] },
      { name: "Color", items: ["Red", "Blue", "Green"] },
    ],
    clues: [
      { text: "Alice owns the cat." },
      { text: "The dog owner's favorite color is blue." },
      { text: "Carol's favorite color is green." },
      { text: "Bob does not own the fish." },
      { text: "The cat owner's favorite color is red." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 2: Breakfast — Dan→Coffee→Toast, Eve→Tea→Cereal, Frank→Juice→Eggs
  {
    categories: [
      { name: "Person", items: ["Dan", "Eve", "Frank"] },
      { name: "Drink", items: ["Coffee", "Tea", "Juice"] },
      { name: "Food", items: ["Toast", "Cereal", "Eggs"] },
    ],
    clues: [
      { text: "Eve drinks tea." },
      { text: "The coffee drinker eats toast." },
      { text: "Frank does not eat cereal." },
      { text: "Dan does not drink juice." },
      { text: "The juice drinker eats eggs." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 3: Sports — Grace→Tennis→Monday, Henry→Soccer→Wednesday, Iris→Swimming→Friday
  {
    categories: [
      { name: "Athlete", items: ["Grace", "Henry", "Iris"] },
      { name: "Sport", items: ["Tennis", "Soccer", "Swimming"] },
      { name: "Day", items: ["Monday", "Wednesday", "Friday"] },
    ],
    clues: [
      { text: "Grace plays tennis." },
      { text: "The soccer player practices on Wednesday." },
      { text: "Iris practices on Friday." },
      { text: "Henry does not swim." },
      { text: "Grace practices on Monday." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 4: Music — Kim→Piano→Classical, Leo→Guitar→Jazz, Mia→Drums→Rock
  {
    categories: [
      { name: "Musician", items: ["Kim", "Leo", "Mia"] },
      { name: "Instrument", items: ["Piano", "Guitar", "Drums"] },
      { name: "Genre", items: ["Jazz", "Rock", "Classical"] },
    ],
    clues: [
      { text: "Leo plays guitar." },
      { text: "The pianist plays classical music." },
      { text: "Kim does not play drums." },
      { text: "Mia plays rock music." },
      { text: "The drummer does not play jazz." },
    ],
    solution: buildSolution([0, 1, 2], [2, 0, 1]),
  },

  // 5: Vacation — Nina→Paris→March, Oscar→Tokyo→June, Pat→Cairo→September
  {
    categories: [
      { name: "Traveler", items: ["Nina", "Oscar", "Pat"] },
      { name: "Destination", items: ["Paris", "Tokyo", "Cairo"] },
      { name: "Month", items: ["March", "June", "September"] },
    ],
    clues: [
      { text: "Oscar travels in June." },
      { text: "The person going to Paris travels in March." },
      { text: "Pat is going to Cairo." },
      { text: "Nina is not going to Tokyo." },
      { text: "The Tokyo trip is in June." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 6: Baking — Quinn→Cake→Chocolate, Rosa→Pie→Vanilla, Sam→Cookies→Lemon
  {
    categories: [
      { name: "Baker", items: ["Quinn", "Rosa", "Sam"] },
      { name: "Pastry", items: ["Cake", "Pie", "Cookies"] },
      { name: "Flavor", items: ["Chocolate", "Vanilla", "Lemon"] },
    ],
    clues: [
      { text: "Rosa bakes pie." },
      { text: "The cake baker uses chocolate." },
      { text: "Rosa uses vanilla." },
      { text: "Quinn does not bake cookies." },
      { text: "The cookie baker uses lemon." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 7: School — Tara→Math→A, Uma→Science→B, Vic→Art→C
  {
    categories: [
      { name: "Student", items: ["Tara", "Uma", "Vic"] },
      { name: "Subject", items: ["Math", "Science", "Art"] },
      { name: "Grade", items: ["A", "B", "C"] },
    ],
    clues: [
      { text: "Uma studies science." },
      { text: "The math student got an A." },
      { text: "Uma did not get a C." },
      { text: "Tara does not study art." },
      { text: "The art student got a C." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },

  // 8: Garden — Wendy→Rose→Shovel, Xander→Tulip→Hose, Yuki→Daisy→Rake
  {
    categories: [
      { name: "Gardener", items: ["Wendy", "Xander", "Yuki"] },
      { name: "Flower", items: ["Rose", "Tulip", "Daisy"] },
      { name: "Tool", items: ["Shovel", "Hose", "Rake"] },
    ],
    clues: [
      { text: "Xander grows tulips." },
      { text: "The rose grower uses a shovel." },
      { text: "Xander does not use a rake." },
      { text: "Wendy does not grow daisies." },
      { text: "The daisy grower uses a rake." },
    ],
    solution: buildSolution([0, 1, 2], [0, 1, 2]),
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getRandomPuzzle(): PuzzleDefinition {
  const idx = Math.floor(Math.random() * verifiedPuzzles.length);
  return verifiedPuzzles[idx];
}

/**
 * Check if the player's grid matches the solution for all sub-grids.
 */
export function checkSolution(grid: GridState, puzzle: PuzzleDefinition): boolean {
  for (const key of Object.keys(puzzle.solution)) {
    const solGrid = puzzle.solution[key];
    const playerGrid = grid[key];
    if (!playerGrid) return false;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const expected = solGrid[r][c];
        const actual = playerGrid[r][c];
        // "yes" must match true, "no" or null must match false
        if (expected && actual !== "yes") return false;
        if (!expected && actual === "yes") return false;
      }
    }
  }
  return true;
}

/**
 * When a "yes" is placed at (row, col) in a sub-grid, all other cells
 * in the same row and column of that sub-grid should be "no".
 * Returns list of [row, col] pairs to mark as "no".
 */
export function getAutoEliminations(
  subGrid: CellMark[][],
  row: number,
  col: number
): [number, number][] {
  const elims: [number, number][] = [];
  for (let c = 0; c < 3; c++) {
    if (c !== col && subGrid[row][c] !== "yes") {
      elims.push([row, c]);
    }
  }
  for (let r = 0; r < 3; r++) {
    if (r !== row && subGrid[r][col] !== "yes") {
      elims.push([r, col]);
    }
  }
  return elims;
}

/**
 * Cross-grid inference: given two sub-grids that share a category,
 * deduce marks in the third sub-grid.
 *
 * If A-B has A[i]↔B[j] (yes) and A-C has A[i]↔C[k] (yes),
 * then B-C should have B[j]↔C[k] (yes).
 *
 * Returns array of { key, row, col, mark } to apply.
 */
export function getCrossGridInferences(
  grid: GridState
): { key: string; row: number; col: number; mark: CellMark }[] {
  const inferences: { key: string; row: number; col: number; mark: CellMark }[] = [];

  // For each pair of sub-grids sharing a category, find inferences
  // Sub-grids: "0-1", "0-2", "1-2"
  // "0-1" and "0-2" share cat 0 → infer "1-2"
  inferFromPair(grid, "0-1", "0-2", "1-2", "row", "row", inferences);
  // "0-1" and "1-2" share cat 1 → infer "0-2"
  inferFromPair(grid, "0-1", "1-2", "0-2", "col", "row", inferences);
  // "0-2" and "1-2" share cat 2 → infer "0-1"
  inferFromPair(grid, "0-2", "1-2", "0-1", "col", "col", inferences);

  return inferences;
}

function inferFromPair(
  grid: GridState,
  keyAB: string,
  keyAC: string,
  keyBC: string,
  abSharedAxis: "row" | "col",
  acSharedAxis: "row" | "col",
  inferences: { key: string; row: number; col: number; mark: CellMark }[]
) {
  const sgAB = grid[keyAB];
  const sgAC = grid[keyAC];
  const sgBC = grid[keyBC];
  if (!sgAB || !sgAC || !sgBC) return;

  for (let i = 0; i < 3; i++) {
    // Find "yes" in sgAB where the shared category item is i
    let abMatch: number | null = null;
    for (let j = 0; j < 3; j++) {
      const val = abSharedAxis === "row" ? sgAB[i][j] : sgAB[j][i];
      if (val === "yes") {
        abMatch = j;
        break;
      }
    }
    if (abMatch === null) continue;

    // Find "yes" in sgAC where the shared category item is i
    let acMatch: number | null = null;
    for (let k = 0; k < 3; k++) {
      const val = acSharedAxis === "row" ? sgAC[i][k] : sgAC[k][i];
      if (val === "yes") {
        acMatch = k;
        break;
      }
    }
    if (acMatch === null) continue;

    // Infer: in sgBC, abMatch ↔ acMatch should be "yes"
    if (sgBC[abMatch][acMatch] !== "yes") {
      inferences.push({ key: keyBC, row: abMatch, col: acMatch, mark: "yes" });
    }
  }
}
