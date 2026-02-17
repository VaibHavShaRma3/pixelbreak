# PixelBreak

A **full-stack browser game platform** built with Next.js 16, React 19, and TypeScript. 19 playable games across 4 categories, real-time leaderboards, user profiles with achievements, a blog system, and OAuth authentication — all wrapped in a neon-cyberpunk UI theme.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) |
| **UI** | React 19.2.3, Tailwind CSS 4 |
| **Language** | TypeScript (strict mode) |
| **State** | Zustand 5.0.11 (per-game stores) |
| **Auth** | NextAuth.js 5 beta (GitHub, Google, Discord OAuth) |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **3D Engine** | Three.js 0.171 + Cannon-ES 0.20 (Velocity.js) |
| **Icons** | Lucide React |
| **UI Primitives** | Radix UI (Avatar, Dialog, Dropdown, Tabs, Toast) |
| **Effects** | canvas-confetti, custom particle system |
| **Testing** | Vitest + Testing Library |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) serverless)

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://...

AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000

AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_DISCORD_ID=...
AUTH_DISCORD_SECRET=...
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

```bash
npx drizzle-kit push    # Push schema to database
npx drizzle-kit studio  # Optional: visual DB browser
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages (no navbar)
│   ├── (main)/           # All main pages (with navbar/footer)
│   │   ├── page.tsx          # Homepage
│   │   ├── games/            # /games + /games/[slug]
│   │   ├── leaderboards/     # Global leaderboards
│   │   ├── blog/             # Blog index + /blog/[slug]
│   │   └── profile/[username]/ # User profiles
│   ├── api/              # 7 API routes
│   └── globals.css       # Neon theme, animations, CSS variables
├── components/
│   ├── game/             # GameShell, GameLoader
│   ├── layout/           # Navbar, Footer
│   ├── ui/               # 19 reusable components
│   └── theme-provider.tsx
├── games/
│   ├── _shared/          # use-canvas, use-game-loop, use-timer
│   └── [19 game dirs]/   # Each: index.tsx, store.ts, config.ts, engine.ts
├── lib/
│   ├── auth/             # NextAuth config
│   ├── db/               # Drizzle schema + connection
│   ├── game-registry.ts  # All 19 game configs
│   └── utils.ts          # Formatters, helpers
└── types/
    ├── game.ts           # GameConfig, GameState, GameCallbacks
    └── blog.ts           # BlogPost types
```

---

## Game Plugin Architecture

Every game follows a standardized pattern:

**1. Registration** — `src/lib/game-registry.ts` defines the `GameConfig` (metadata, rules, UI hints).

**2. Dynamic Loading** — `src/components/game/game-loader.tsx` uses `next/dynamic` with `ssr: false` to lazy-load each game.

**3. GameShell Wrapper** — `src/components/game/game-shell.tsx` provides:
- HUD (title, score display, play/pause/reset controls)
- State machine: `idle -> playing -> paused -> gameover`
- Confetti celebrations on game over
- "How to Play" instructions panel
- Score submission to API

**4. Render Props** — Each game receives:

```typescript
{
  gameState: "idle" | "playing" | "paused" | "gameover",
  score: number,
  setScore: (s: number | ((prev: number) => number)) => void,
  callbacks: {
    onGameStart: () => void,
    onGameEnd: (finalScore: number) => void,
    onScoreSubmit: (score: number, metadata?) => Promise<void>,
  },
  startGame, pauseGame, resetGame
}
```

**5. Per-Game Store** — Each game uses Zustand for internal state (positions, combos, timers), keeping React state minimal.

### Rendering Modes

- **DOM** — Pure React components (Bubble Wrap, Color Match, Sudoku, etc.)
- **Canvas** — HTML5 Canvas via `useCanvas` hook (Stack, Falling Sand, Zen Garden, etc.)
- **Three.js WebGL** — Custom mount with Cannon-ES physics (Velocity.js)

### Adding a New Game

1. Create `src/games/your-game/` with `index.tsx`, `store.ts`, and optionally `config.ts` + `engine.ts`
2. Add a `GameConfig` entry to `src/lib/game-registry.ts`
3. Add a dynamic import to `src/components/game/game-loader.tsx`
4. Add a preview component to `src/components/ui/game-preview.tsx`
5. Update the game count on the homepage

---

## All 19 Games

### Arcade (4)

| Game | Difficulty | Time | Score | Description |
|------|-----------|------|-------|-------------|
| **Stack** | Medium | 2-5 min | Points | Drop blocks — only the overlapping portion stays. Speed increases. Space/click to drop. |
| **Neon Rhythm** | Hard | 3-5 min | Combo | 4-lane rhythm game (D/F/J/K keys). Perfect/Good/Miss timing windows. 3 songs. |
| **1-Minute Barista** | Hard | 1 min | Points | Serve coffee orders — match ingredients, serve fast for bonuses. |
| **Velocity.js** | Medium | 3-5 min | Time | 3D neon racing with Three.js + Cannon-ES. WASD controls, drift boost, 3 laps, 7 AI opponents. |

### Puzzle (5)

| Game | Difficulty | Time | Score | Description |
|------|-----------|------|-------|-------------|
| **Color Match** | Medium | 2-5 min | Accuracy | Match the color name to the correct swatch (ignore misleading text color). 10 rounds. |
| **Sudoku Lite** | Medium | 3-10 min | Time | 4x4 Sudoku — fill grid with 1-4, race against the clock. Arrow keys + number keys. |
| **Daily Pixel Puzzle** | Easy | 3-5 min | Points | Reveal pixel art tiles, guess the image. Fewer reveals = higher score. |
| **Syntax Breaker** | Hard | 3-5 min | Points | Find syntax errors in code snippets before the timer runs out. 5 levels. |
| **Constellation Hunter** | Medium | 3-5 min | Points | Connect stars to form target constellations. Multi-level with time bonuses. |

### Creative (4)

| Game | Difficulty | Time | Score | Description |
|------|-----------|------|-------|-------------|
| **Falling Sand** | Easy | 5+ min | Custom | Particle sandbox — drop sand, water, fire, walls. Physics interactions. |
| **Hexagon Land** | Medium | 5-10 min | Points | Place 20 hex tiles with 6 biome types. +3 bonus per adjacent biome match. |
| **Magnetic Poetry** | Easy | 5+ min | Custom | Drag word magnets onto a fridge board to create poems. |
| **Community Grid** | Easy | Ongoing | Custom | Collaborative 32x32 pixel art canvas. Pencil, fill, eraser tools. Up to 100 players. |

### Chill (6)

| Game | Difficulty | Time | Score | Description |
|------|-----------|------|-------|-------------|
| **Bubble Wrap Blitz** | Easy | 30 sec | Points | Pop as many bubbles as you can in 30 seconds. Grid regenerates when cleared. |
| **Lo-Fi Typer** | Medium | 2-5 min | Combo | Type sentences accurately. Combo multiplier builds on consecutive correct keystrokes. |
| **Gacha Capsule** | Easy | 5+ min | Custom | Spend coins to pull capsules with rarity tiers. Collect items, cash out for score. |
| **Zen Garden** | Easy | 5+ min | Custom | Rake patterns, place stones and plants. Earn serenity points. |
| **Workspace Pet** | Easy | Ongoing | Custom | Virtual pet with hunger/happiness/energy stats. Feed, play, sleep, pet. |
| **Focus Forest** | Easy | 5-25 min | Time | Focus timer — tree grows through 5 stages over 25 minutes. Harvest to save. |

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero with particle background, featured games grid, animated stats counters |
| `/games` | All 19 games grid with category filter (arcade/puzzle/creative/chill) |
| `/games/[slug]` | Game page — GameLoader + leaderboard sidebar + reviews |
| `/leaderboards` | Global leaderboards — per-game, filterable by Today/Week/All Time |
| `/blog` | Blog listing with search, seed data fallback |
| `/blog/[slug]` | Blog post with markdown rendering |
| `/profile/[username]` | User stats dashboard — per-game stats, achievements, favorites |
| `/login` | OAuth sign-in (GitHub, Google, Discord) |
| `/register` | Registration page |

---

## API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/games` | No | Get game(s) by slug, category, or enabled status |
| GET | `/api/scores` | No | Leaderboard — by game, period (daily/weekly/alltime), limit |
| POST | `/api/scores` | Yes | Submit score with optional metadata |
| GET | `/api/reviews` | No | Get reviews for a game (last 50) |
| POST | `/api/reviews` | Yes | Submit review (1-5 rating + content, 1 per user per game) |
| GET/PATCH | `/api/users` | Mixed | Get profile by username / Update own profile |
| GET | `/api/users/stats` | No | Comprehensive user stats + achievements |
| ALL | `/api/auth/[...nextauth]` | -- | NextAuth OAuth handlers |
| GET | `/api/blog` | No | Get blog posts or single post by slug |

---

## Database Schema

**11 tables** managed by Drizzle ORM:

### Auth Tables
- `users` — Profiles (id, name, email, image, username, bio)
- `accounts` — OAuth provider links
- `sessions` — Session management
- `verificationTokens` — Email verification

### Game Tables
- `games` — Game metadata (slug, title, category, playCount)
- `scores` — Score entries (userId, gameSlug, score, metadata JSON, createdAt)
- `userGameStats` — Per-user per-game aggregates (totalPlays, highScore, avgScore, lastPlayedAt)

### Social Tables
- `reviews` — Game reviews with 1-5 ratings (unique per user per game)
- `blogPosts` — Blog articles with markdown content

### Achievement Tables
- `achievements` — Definitions with criteria JSON
- `userAchievements` — Unlock records per user

---

## Styling & Theme

- **Neon-cyberpunk** aesthetic with CSS custom properties
- **Neon palette:** Cyan (`#00fff5`), Pink (`#ff2d95`), Green (`#39ff14`), Purple (`#b026ff`), Yellow (`#ffe600`)
- **Fonts:** Press Start 2P (pixel font for headings), system sans/mono
- **Dark/Light mode** via ThemeProvider
- **Effects:** Glow text shadows, glitch text animation, particle backgrounds, 3D tilt cards, scroll-reveal animations, confetti celebrations
- **Responsive:** Mobile-first with Tailwind breakpoints (sm/md/lg)

---

## UI Components (27 total)

### Interactive
TiltCard (3D hover), ParticleBackground, ScrollReveal, AnimatedCounter, AnimatedGradientText, ConfettiCannon, CustomCursor, ActivityTicker, GamePreview (19 unique animated previews per game)

### Core
Button, Badge, Card, Input, Skeleton, BackToTop, CategoryFilter, NeonToast

### Layout
Navbar (sticky, scroll-aware, mobile hamburger menu), Footer, ThemeProvider

---

## Scripts

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm run test      # Vitest unit tests
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) with:

1. Connect your GitHub repository
2. Set all environment variables in Vercel dashboard
3. Deploy — Next.js is auto-detected

For other platforms, run `npm run build` and serve the `.next` output.

---

## License

Private project.
