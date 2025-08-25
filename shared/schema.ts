import { pgTable, text, serial, integer, boolean, json, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and data ownership
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password for authentication
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// User sessions for authentication
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced teams table with user ownership
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), // Owner of this team
  name: text("name").notNull(),
  location: text("location"),
  logoPath: text("logo_path"), // Will store Cloudinary/cloud URLs
  logoPublicId: text("logo_public_id"), // For cloud storage management
  colorScheme: text("color_scheme").default("pink"),
  customColor: text("custom_color"),
  customTextColor: text("custom_text_color").default("#FFFFFF"),
  customSetBackgroundColor: text("custom_set_background_color").default("#000000"),
  isTemplate: boolean("is_template").default(false), // Allow sharing team templates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced matches table with user ownership
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), // Owner of this match
  name: text("name"), // Optional match name for organization
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  format: integer("format").notNull().default(5), // 3 or 5 sets
  currentSet: integer("current_set").notNull().default(1),
  homeSetsWon: integer("home_sets_won").notNull().default(0),
  awaySetsWon: integer("away_sets_won").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  status: text("status").default("in_progress"), // in_progress, completed, paused
  winner: text("winner"), // home, away, or null
  setHistory: json("set_history").$type<Array<{setNumber: number, homeScore: number, awayScore: number, winner: 'home' | 'away' | null}>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastPlayed: timestamp("last_played"), // For tracking recent matches
});

// Enhanced game state with user ownership
export const gameState = pgTable("game_state", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  theme: text("theme").default("default"),
  displayOptions: json("display_options").$type<{
    showSetHistory: boolean;
    showSponsors: boolean;
    showTimer: boolean;
  }>().default({ showSetHistory: true, showSponsors: true, showTimer: false }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced settings with user ownership
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), // Owner of these settings
  sponsorLogoPath: text("sponsor_logo_path"), // Cloud storage URL
  sponsorLogoPublicId: text("sponsor_logo_public_id"), // For cloud storage management
  primaryColor: text("primary_color").default("#1565C0"),
  accentColor: text("accent_color").default("#FF6F00"),
  theme: text("theme").default("standard"),
  defaultMatchFormat: integer("default_match_format").default(5),
  autoSave: boolean("auto_save").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved scoreboard templates for quick reuse
export const scoreboardTemplates = pgTable("scoreboard_templates", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // Template name like "High School Tournament"
  description: text("description"),
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  settings: json("settings").$type<{
    primaryColor: string;
    accentColor: string;
    theme: string;
    displayOptions: {
      showSetHistory: boolean;
      showSponsors: boolean;
      showTimer: boolean;
    };
  }>(),
  isPublic: boolean("is_public").default(false), // Allow sharing templates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validation with Zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGameStateSchema = createInsertSchema(gameState).omit({ id: true, updatedAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScoreboardTemplateSchema = createInsertSchema(scoreboardTemplates).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type GameState = typeof gameState.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type ScoreboardTemplate = typeof scoreboardTemplates.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertScoreboardTemplate = z.infer<typeof insertScoreboardTemplateSchema>;
