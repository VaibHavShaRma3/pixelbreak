import type { BlogPostSummary, BlogPost } from "@/types/blog";

type SeedBlogPost = BlogPost & BlogPostSummary;

export const seedBlogPosts: SeedBlogPost[] = [
  {
    id: "seed-1",
    slug: "welcome-to-pixelbreak",
    title: "Welcome to PixelBreak!",
    excerpt:
      "We're launching with 4 amazing browser games. Here's what's coming next.",
    content: `# Welcome to PixelBreak!\n\nWe're thrilled to launch **PixelBreak** — a collection of browser-based games you can play instantly, no downloads required.\n\n## What's Live Now\n\nWe're starting with 4 carefully crafted games:\n\n- **Infinite Bubble Wrap** — Pure satisfaction. Pop bubbles endlessly.\n- **Color Match** — Test your brain with the Stroop effect.\n- **Stack** — Time your drops to build the tallest tower.\n- **Sudoku Lite** — Quick 4×4 puzzles against the clock.\n\n## What's Coming\n\nWe have **14 more games** in development across puzzle, creative, and chill categories. Expect games like:\n\n- **Falling Sand** — A physics sandbox\n- **Lo-Fi Typer** — Type to the beat\n- **Constellation Hunter** — Connect the stars\n- **Syntax Breaker** — Debug code fast\n\n## Leaderboards & Accounts\n\nEvery game has its own leaderboard with daily, weekly, and all-time filters. Sign in to save your scores and compete!\n\nStay tuned for more updates. Happy gaming! 🎮`,
    coverImage: null,
    published: true,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    authorName: "PixelBreak Team",
    authorImage: null,
  },
  {
    id: "seed-2",
    slug: "building-stack-game",
    title: "How We Built the Stack Game",
    excerpt:
      "A deep dive into Canvas API rendering, game loops, and the physics behind Stack.",
    content: `# How We Built the Stack Game\n\nStack is one of our launch titles — a simple concept with satisfying mechanics. Here's how we built it.\n\n## The Game Loop\n\nStack runs on a custom \`requestAnimationFrame\` loop with delta-time calculations. This ensures smooth animation regardless of frame rate.\n\n\`\`\`\nconst update = (timestamp) => {\n  const delta = timestamp - lastTime;\n  lastTime = timestamp;\n  updateMovingBlock(state, delta);\n  renderState(ctx, state);\n  requestAnimationFrame(update);\n};\n\`\`\`\n\n## Canvas Rendering\n\nWe chose the Canvas API over DOM rendering for Stack because:\n\n- **Performance** — No layout recalculations\n- **Precision** — Pixel-perfect block alignment\n- **Camera** — Smooth camera follow as the stack grows\n\n## The Physics\n\nWhen a block is dropped, we calculate the overlap with the block below:\n\n- **Perfect drop** — Block lands exactly on target (within 2px tolerance)\n- **Partial overlap** — Block is trimmed to the overlapping portion\n- **Complete miss** — Game over!\n\nThe speed increases with each successful drop, creating a satisfying difficulty curve.\n\n## What's Next\n\nWe're exploring adding particle effects on perfect drops and a combo multiplier. Stay tuned!`,
    coverImage: null,
    published: true,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
    authorName: "PixelBreak Team",
    authorImage: null,
  },
  {
    id: "seed-3",
    slug: "phase-2-preview",
    title: "Phase 2 Preview: 6 New Games Coming Soon",
    excerpt:
      "Daily Pixel Puzzle, Lo-Fi Typer, Falling Sand, and more — here's a sneak peek.",
    content: `# Phase 2 Preview: 6 New Games\n\nWe're hard at work on the next wave of PixelBreak games. Here's what to expect.\n\n## Daily Pixel Puzzle\n\nA new pixel art puzzle every day. Tiles are revealed one at a time — guess the image as fast as you can for bonus points.\n\n## Lo-Fi Typer\n\nType along to chill beats. Your accuracy and speed combine into a combo score. Miss a key and your combo resets.\n\n## Falling Sand\n\nOur first creative sandbox game. Drop particles of sand, water, and fire and watch them interact with realistic physics.\n\n## Syntax Breaker\n\nFor the developers out there — find and fix syntax errors in code snippets before time runs out. JavaScript, Python, and more.\n\n## Constellation Hunter\n\nConnect stars on a canvas to form constellations. Each level adds more stars and more complex patterns.\n\n## Gacha Capsule\n\nSpend virtual coins on capsule machines. Collect rare items across multiple themed sets. Gotta catch 'em all!\n\n---\n\nExpect these games to roll out over the next few weeks. Follow us for updates!`,
    coverImage: null,
    published: true,
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
    authorName: "PixelBreak Team",
    authorImage: null,
  },
];
