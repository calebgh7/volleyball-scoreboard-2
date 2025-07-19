import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  logoPath: text("logo_path"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  format: integer("format").notNull().default(5), // 3 or 5 sets
  currentSet: integer("current_set").notNull().default(1),
  homeSetsWon: integer("home_sets_won").notNull().default(0),
  awaySetsWon: integer("away_sets_won").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  setHistory: json("set_history").$type<Array<{setNumber: number, homeScore: number, awayScore: number, winner: 'home' | 'away' | null}>>().default([]),
});

export const gameState = pgTable("game_state", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  displayOptions: json("display_options").$type<{
    showSetHistory: boolean;
    showSponsors: boolean;
    showTimer: boolean;
  }>().default({ showSetHistory: true, showSponsors: true, showTimer: false }),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  sponsorLogoPath: text("sponsor_logo_path"),
  primaryColor: text("primary_color").default("#1565C0"),
  accentColor: text("accent_color").default("#FF6F00"),
  theme: text("theme").default("standard"),
});

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export const insertGameStateSchema = createInsertSchema(gameState).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type Team = typeof teams.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type GameState = typeof gameState.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
