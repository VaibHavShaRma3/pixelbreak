import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  uniqueIndex,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

// ─── Auth.js tables ───

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  username: text("username").unique(),
  bio: text("bio"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ─── Game tables ───

export const games = pgTable("games", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // arcade, puzzle, creative, chill
  scoreType: text("score_type").notNull(), // points, time, accuracy, combo, custom
  renderingMode: text("rendering_mode").notNull(), // dom, canvas, phaser
  thumbnail: text("thumbnail"),
  color: text("color").notNull().default("#00fff5"),
  enabled: boolean("enabled").notNull().default(true),
  playCount: integer("play_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const scores = pgTable(
  "scores",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug")
      .notNull()
      .references(() => games.slug, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    metadata: jsonb("metadata"), // game-specific data (e.g. level, accuracy %)
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("scores_user_game_idx").on(table.userId, table.gameSlug, table.createdAt)]
);

export const userGameStats = pgTable(
  "user_game_stats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug")
      .notNull()
      .references(() => games.slug, { onDelete: "cascade" }),
    totalPlays: integer("total_plays").notNull().default(0),
    highScore: integer("high_score").notNull().default(0),
    totalScore: integer("total_score").notNull().default(0),
    averageScore: real("average_score").notNull().default(0),
    lastPlayedAt: timestamp("last_played_at", { mode: "date" }),
  },
  (table) => [
    uniqueIndex("user_game_stats_unique").on(table.userId, table.gameSlug),
  ]
);

// ─── Reviews ───

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug")
      .notNull()
      .references(() => games.slug, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_user_game_unique").on(table.userId, table.gameSlug),
  ]
);

// ─── Blog ───

export const blogPosts = pgTable("blog_posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image"),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Achievements ───

export const achievements = pgTable("achievements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: jsonb("criteria").notNull(), // JSON criteria for unlocking
  gameSlug: text("game_slug").references(() => games.slug, {
    onDelete: "cascade",
  }), // null = global achievement
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_achievements_unique").on(
      table.userId,
      table.achievementId
    ),
  ]
);
