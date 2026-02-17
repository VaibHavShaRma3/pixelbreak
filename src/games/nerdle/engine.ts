// Nerdle — pure game logic
// Generates and validates 8-character math equations like "12+34=46"

type CellResult = "correct" | "present" | "absent";

const VALID_CHARS = "0123456789+-*/=";
const OPERATORS = ["+", "-", "*", "/"] as const;

/**
 * Generate a random valid 8-character equation of the form "A op B = C".
 * Tries random combinations until one produces an integer result
 * and the full string is exactly 8 characters.
 */
export function generateEquation(): string {
  const maxAttempts = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];

    // Determine ranges based on operator to get good variety
    let a: number, b: number, c: number;

    switch (op) {
      case "+": {
        a = randInt(1, 99);
        b = randInt(1, 99);
        c = a + b;
        break;
      }
      case "-": {
        a = randInt(2, 99);
        b = randInt(1, a - 1); // ensure positive result
        c = a - b;
        break;
      }
      case "*": {
        a = randInt(2, 50);
        b = randInt(2, 20);
        c = a * b;
        break;
      }
      case "/": {
        // Generate division that yields an integer
        b = randInt(2, 15);
        c = randInt(1, 20);
        a = b * c; // ensures a / b = c exactly
        break;
      }
    }

    const equation = `${a}${op}${b}=${c}`;

    if (equation.length === 8) {
      return equation;
    }
  }

  // Fallback: guaranteed 8-char equations
  const fallbacks = [
    "12+34=46",
    "56-23=33",
    "48/12=04",
    "11+27=38",
    "93-56=37",
    "15*04=60",
    "72/08=09",
    "34+52=86",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Evaluate a guess against the answer.
 * Returns an array of 8 CellResults using Wordle-style logic:
 *   - "correct": right character in right position
 *   - "present": character exists in the answer but in the wrong position
 *   - "absent":  character does not exist in the answer (at any remaining position)
 *
 * Handles duplicate characters properly: each character in the answer can only
 * be matched once (greens consume first, then yellows left-to-right).
 */
export function evaluateGuess(guess: string, answer: string): CellResult[] {
  const result: CellResult[] = new Array(8).fill("absent");
  const answerChars = answer.split("");
  const guessChars = guess.split("");

  // Track which answer positions have been "consumed"
  const consumed = new Array(8).fill(false);

  // First pass: mark correct (green) matches
  for (let i = 0; i < 8; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
      consumed[i] = true;
    }
  }

  // Second pass: mark present (yellow) matches
  for (let i = 0; i < 8; i++) {
    if (result[i] === "correct") continue;

    for (let j = 0; j < 8; j++) {
      if (!consumed[j] && guessChars[i] === answerChars[j]) {
        result[i] = "present";
        consumed[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Validate that a string is a valid 8-character equation.
 * Rules:
 *   - Exactly 8 characters long
 *   - Contains exactly one "=" sign
 *   - Only valid characters: 0-9, +, -, *, /, =
 *   - Left side is a valid arithmetic expression
 *   - Right side is a valid number
 *   - The math checks out (left side evaluates to right side)
 */
export function isValidEquation(str: string): boolean {
  if (str.length !== 8) return false;

  // Only valid characters
  for (const ch of str) {
    if (!VALID_CHARS.includes(ch)) return false;
  }

  // Exactly one "="
  const eqParts = str.split("=");
  if (eqParts.length !== 2) return false;

  const [left, right] = eqParts;
  if (!left || !right) return false;

  // Right side must be a valid integer
  if (!/^\d+$/.test(right)) return false;
  const rightValue = parseInt(right, 10);

  // Evaluate the left side safely
  const leftValue = safeEval(left);
  if (leftValue === null) return false;

  // Must be an integer and match the right side
  if (!Number.isInteger(leftValue)) return false;
  if (leftValue !== rightValue) return false;

  return true;
}

/**
 * Safely evaluate a simple arithmetic expression containing
 * only digits and the operators +, -, *, /.
 * Returns null if the expression is invalid.
 */
function safeEval(expr: string): number | null {
  // Tokenize: split into numbers and operators
  const tokens: (number | string)[] = [];
  let numBuf = "";

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch >= "0" && ch <= "9") {
      numBuf += ch;
    } else if ("+-*/".includes(ch)) {
      if (numBuf === "") return null; // operator without preceding number
      tokens.push(parseInt(numBuf, 10));
      tokens.push(ch);
      numBuf = "";
    } else {
      return null; // invalid character
    }
  }

  if (numBuf === "") return null; // trailing operator
  tokens.push(parseInt(numBuf, 10));

  // Must have at least one operator (number op number)
  if (tokens.length < 3) return null;

  // Evaluate with proper order of operations:
  // First pass: handle * and /
  const addSub: (number | string)[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (typeof tokens[i] === "number") {
      let value = tokens[i] as number;

      while (
        i + 2 < tokens.length &&
        (tokens[i + 1] === "*" || tokens[i + 1] === "/")
      ) {
        const op = tokens[i + 1] as string;
        const next = tokens[i + 2] as number;
        if (op === "*") {
          value *= next;
        } else {
          if (next === 0) return null; // division by zero
          value /= next;
        }
        i += 2;
      }

      addSub.push(value);
    } else {
      addSub.push(tokens[i]);
    }
    i++;
  }

  // Second pass: handle + and -
  let result = addSub[0] as number;
  for (let j = 1; j < addSub.length; j += 2) {
    const op = addSub[j] as string;
    const operand = addSub[j + 1] as number;
    if (op === "+") {
      result += operand;
    } else if (op === "-") {
      result -= operand;
    }
  }

  return result;
}

/**
 * Get the set of valid characters for the Nerdle keyboard.
 */
export function getValidChars(): string[] {
  return VALID_CHARS.split("");
}
