// Connections — puzzle bank and pure game logic
// Each puzzle has 4 groups of 4 words. The player must find all groups.

export interface GroupDef {
  category: string;
  words: string[];
  difficulty: number; // 1=easiest, 4=hardest
  color: string;
}

export interface PuzzleSet {
  groups: GroupDef[];
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------------
// Puzzle bank — at least 10 diverse sets with tricky overlaps
// ------------------------------------------------------------------
export const PUZZLE_BANK: PuzzleSet[] = [
  // 1
  {
    groups: [
      { category: "Programming Languages", words: ["PYTHON", "JAVA", "RUBY", "SWIFT"], difficulty: 1, color: "#a78bfa" },
      { category: "Planets", words: ["MARS", "VENUS", "SATURN", "JUPITER"], difficulty: 2, color: "#4ade80" },
      { category: "Card Games", words: ["POKER", "BRIDGE", "RUMMY", "SOLITAIRE"], difficulty: 3, color: "#60a5fa" },
      { category: "Dances", words: ["SALSA", "TANGO", "WALTZ", "FOXTROT"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 2
  {
    groups: [
      { category: "Colors", words: ["RED", "BLUE", "GREEN", "GOLD"], difficulty: 1, color: "#a78bfa" },
      { category: "Metals", words: ["IRON", "STEEL", "COPPER", "SILVER"], difficulty: 2, color: "#4ade80" },
      { category: "Fish", words: ["BASS", "TROUT", "SALMON", "PERCH"], difficulty: 3, color: "#60a5fa" },
      { category: "Royalty Titles", words: ["KING", "QUEEN", "PRINCE", "DUKE"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 3 — words that could be body parts, cars, or other things
  {
    groups: [
      { category: "Body Parts", words: ["ARM", "BACK", "CHEST", "SHOULDER"], difficulty: 1, color: "#a78bfa" },
      { category: "Car Brands", words: ["FORD", "TESLA", "HONDA", "LEXUS"], difficulty: 2, color: "#4ade80" },
      { category: "Kitchen Tools", words: ["WHISK", "LADLE", "TONGS", "GRATER"], difficulty: 3, color: "#60a5fa" },
      { category: "Musical Instruments", words: ["DRUM", "HARP", "FLUTE", "CELLO"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 4 — tricky: words that overlap categories
  {
    groups: [
      { category: "Things That Are Round", words: ["GLOBE", "PEARL", "WHEEL", "COIN"], difficulty: 1, color: "#a78bfa" },
      { category: "Breakfast Items", words: ["WAFFLE", "BAGEL", "CEREAL", "TOAST"], difficulty: 2, color: "#4ade80" },
      { category: "Fantasy Creatures", words: ["DRAGON", "PHOENIX", "GRIFFIN", "UNICORN"], difficulty: 3, color: "#60a5fa" },
      { category: "Types of Code", words: ["BINARY", "MORSE", "CIPHER", "BRAILLE"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 5
  {
    groups: [
      { category: "Fruits", words: ["APPLE", "MANGO", "PEACH", "LEMON"], difficulty: 1, color: "#a78bfa" },
      { category: "Dog Breeds", words: ["BOXER", "POODLE", "HUSKY", "BEAGLE"], difficulty: 2, color: "#4ade80" },
      { category: "Board Games", words: ["CHESS", "CLUE", "RISK", "SORRY"], difficulty: 3, color: "#60a5fa" },
      { category: "Weather Phenomena", words: ["THUNDER", "BLIZZARD", "TORNADO", "MONSOON"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 6 — overlapping: Mercury is planet/element, Pitch is music/sports
  {
    groups: [
      { category: "Things in Space", words: ["COMET", "NEBULA", "QUASAR", "PULSAR"], difficulty: 1, color: "#a78bfa" },
      { category: "Music Terms", words: ["TEMPO", "CHORD", "PITCH", "RHYTHM"], difficulty: 2, color: "#4ade80" },
      { category: "Fabrics", words: ["SILK", "DENIM", "VELVET", "LINEN"], difficulty: 3, color: "#60a5fa" },
      { category: "Olympic Sports", words: ["FENCING", "ROWING", "DIVING", "JAVELIN"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 7
  {
    groups: [
      { category: "Trees", words: ["MAPLE", "CEDAR", "BIRCH", "WILLOW"], difficulty: 1, color: "#a78bfa" },
      { category: "Currencies", words: ["DOLLAR", "EURO", "POUND", "YEN"], difficulty: 2, color: "#4ade80" },
      { category: "Pasta Types", words: ["PENNE", "ORZO", "RIGATONI", "FUSILLI"], difficulty: 3, color: "#60a5fa" },
      { category: "Greek Gods", words: ["APOLLO", "HERMES", "ATHENA", "POSEIDON"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 8 — tricky: many words could be verbs
  {
    groups: [
      { category: "Parts of a Book", words: ["SPINE", "CHAPTER", "INDEX", "MARGIN"], difficulty: 1, color: "#a78bfa" },
      { category: "Types of Shoes", words: ["LOAFER", "SANDAL", "BOOT", "SNEAKER"], difficulty: 2, color: "#4ade80" },
      { category: "Shades of Blue", words: ["NAVY", "COBALT", "AZURE", "INDIGO"], difficulty: 3, color: "#60a5fa" },
      { category: "Math Concepts", words: ["MATRIX", "VECTOR", "SCALAR", "TENSOR"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 9
  {
    groups: [
      { category: "Vegetables", words: ["CARROT", "ONION", "PEPPER", "CELERY"], difficulty: 1, color: "#a78bfa" },
      { category: "Gemstones", words: ["RUBY", "OPAL", "TOPAZ", "JADE"], difficulty: 2, color: "#4ade80" },
      { category: "Horror Movie Villains", words: ["FREDDY", "JASON", "CHUCKY", "JIGSAW"], difficulty: 3, color: "#60a5fa" },
      { category: "NASA Missions", words: ["APOLLO", "GEMINI", "VOYAGER", "ARTEMIS"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 10 — all words could relate to computing
  {
    groups: [
      { category: "Social Media Platforms", words: ["TWITTER", "REDDIT", "TUMBLR", "DISCORD"], difficulty: 1, color: "#a78bfa" },
      { category: "Coffee Drinks", words: ["LATTE", "MOCHA", "ESPRESSO", "CORTADO"], difficulty: 2, color: "#4ade80" },
      { category: "Knot Types", words: ["BOWLINE", "CLEAT", "HITCH", "REEF"], difficulty: 3, color: "#60a5fa" },
      { category: "Poker Terms", words: ["FLOP", "BLUFF", "FOLD", "ANTE"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 11
  {
    groups: [
      { category: "Spices", words: ["CUMIN", "SAGE", "THYME", "CLOVE"], difficulty: 1, color: "#a78bfa" },
      { category: "Dances", words: ["RUMBA", "POLKA", "SAMBA", "MAMBO"], difficulty: 2, color: "#4ade80" },
      { category: "Architecture Styles", words: ["GOTHIC", "BAROQUE", "DECO", "TUDOR"], difficulty: 3, color: "#60a5fa" },
      { category: "Legendary Swords", words: ["EXCALIBUR", "STING", "GLAMDRING", "ANDURIL"], difficulty: 4, color: "#fbbf24" },
    ],
  },
  // 12
  {
    groups: [
      { category: "Elements", words: ["NEON", "ARGON", "XENON", "RADON"], difficulty: 1, color: "#a78bfa" },
      { category: "Cartoon Characters", words: ["SPONGEBOB", "GARFIELD", "SCOOBY", "POPEYE"], difficulty: 2, color: "#4ade80" },
      { category: "Types of Clouds", words: ["CIRRUS", "STRATUS", "CUMULUS", "NIMBUS"], difficulty: 3, color: "#60a5fa" },
      { category: "Chess Pieces", words: ["ROOK", "BISHOP", "KNIGHT", "PAWN"], difficulty: 4, color: "#fbbf24" },
    ],
  },
];

/**
 * Pick a random puzzle from the bank and return it along with
 * a flat shuffled array of all 16 words.
 */
export function getRandomPuzzle(): { puzzle: PuzzleSet; shuffledWords: string[] } {
  const puzzle = PUZZLE_BANK[Math.floor(Math.random() * PUZZLE_BANK.length)];
  const allWords = puzzle.groups.flatMap((g) => g.words);
  return { puzzle, shuffledWords: shuffle(allWords) };
}

/**
 * Check if the 4 selected words form a valid group in the puzzle.
 * Returns the matching group definition or null.
 */
export function checkGroup(
  words: string[],
  puzzle: PuzzleSet
): GroupDef | null {
  if (words.length !== 4) return null;

  const sorted = [...words].sort();

  for (const group of puzzle.groups) {
    const groupSorted = [...group.words].sort();
    if (
      sorted.length === groupSorted.length &&
      sorted.every((w, i) => w === groupSorted[i])
    ) {
      return group;
    }
  }

  return null;
}

/**
 * Check how close a guess is — returns the max number of words
 * from the guess that belong to any single group. Useful for
 * "one away" feedback.
 */
export function closestGroupOverlap(
  words: string[],
  puzzle: PuzzleSet
): number {
  let maxOverlap = 0;
  for (const group of puzzle.groups) {
    const overlap = words.filter((w) => group.words.includes(w)).length;
    if (overlap > maxOverlap) maxOverlap = overlap;
  }
  return maxOverlap;
}
