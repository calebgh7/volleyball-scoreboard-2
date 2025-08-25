import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { teams, matches, gameState, settings, users, userSessions } from '../shared/schema.js';
import type { InsertTeam, InsertMatch, InsertGameState, InsertSettings, Team, Match, GameState, Settings } from '../shared/schema.js';

// Database connection
let db: ReturnType<typeof drizzle> | null = null;

export async function getDatabase() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = postgres(connectionString);
    db = drizzle(client);
  }
  return db;
}

export interface IStorage {
  createTeam(insertTeam: InsertTeam): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined>;
  createMatch(insertMatch: InsertMatch): Promise<Match>;
  getMatch(id: number): Promise<Match | undefined>;
  updateMatch(id: number, matchUpdate: Partial<InsertMatch>): Promise<Match | undefined>;
  getCurrentMatch(): Promise<Match | undefined>;
  createGameState(insertState: InsertGameState): Promise<GameState>;
  getGameState(matchId: number): Promise<GameState | undefined>;
  updateGameState(matchId: number, stateUpdate: Partial<InsertGameState>): Promise<GameState | undefined>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private teams: Map<number, Team> = new Map();
  private matches: Map<number, Match> = new Map();
  private gameStates: Map<number, GameState> = new Map();
  private settingsData: Settings = {
    id: 1,
    userId: "default-user-id", // Temporary default user ID for in-memory storage
    sponsorLogoPath: null,
    sponsorLogoPublicId: null,
    primaryColor: "#1565C0",
    accentColor: "#FF6F00",
    theme: "standard",
    defaultMatchFormat: 5,
    autoSave: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  private currentTeamId = 1;
  private currentMatchId = 1;
  private currentGameStateId = 1;
  private currentMatchIdActive: number | null = null;

  constructor() {
    // Initialize with default teams
    const homeTeam: Team = {
      id: this.currentTeamId++,
      userId: "default-user-id", // Temporary default user ID
      name: "EAGLES",
      location: "Central High",
      logoPath: null,
      logoPublicId: null,
      colorScheme: "purple",
      customColor: null,
      customTextColor: "#FFFFFF",
      customSetBackgroundColor: "#000000",
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const awayTeam: Team = {
      id: this.currentTeamId++,
      userId: "default-user-id", // Temporary default user ID
      name: "TIGERS", 
      location: "North Valley",
      logoPath: null,
      logoPublicId: null,
      colorScheme: "blue",
      customColor: null,
      customTextColor: "#FFFFFF",
      customSetBackgroundColor: "#000000",
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.teams.set(homeTeam.id, homeTeam);
    this.teams.set(awayTeam.id, awayTeam);
    
    // Initialize default match
    const match: Match = {
      id: this.currentMatchId++,
      userId: "default-user-id", // Temporary default user ID
      name: "Default Match",
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      format: 5,
      currentSet: 3,
      homeSetsWon: 2,
      awaySetsWon: 0,
      isComplete: false,
      status: "in_progress",
      winner: null,
      setHistory: [
        { setNumber: 1, homeScore: 25, awayScore: 23, winner: 'home' as const },
        { setNumber: 2, homeScore: 25, awayScore: 18, winner: 'home' as const },
        { setNumber: 3, homeScore: 0, awayScore: 0, winner: null }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPlayed: new Date()
    };
    
    this.matches.set(match.id, match);
    this.currentMatchIdActive = match.id;
    
    // Initialize game state
    const state: GameState = {
      id: this.currentGameStateId++,
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
      theme: "default",
      displayOptions: {
        showSetHistory: true,
        showSponsors: true,
        showTimer: false
      },
      updatedAt: new Date()
    };
    
    this.gameStates.set(match.id, state);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = { 
      ...insertTeam, 
      id: this.currentTeamId++,
      userId: insertTeam.userId,
      location: insertTeam.location ?? null,
      logoPath: insertTeam.logoPath ?? null,
      logoPublicId: insertTeam.logoPublicId ?? null,
      colorScheme: insertTeam.colorScheme ?? "pink",
      customColor: insertTeam.customColor ?? null,
      customTextColor: insertTeam.customTextColor ?? "#FFFFFF",
      customSetBackgroundColor: insertTeam.customSetBackgroundColor ?? "#000000",
      isTemplate: insertTeam.isTemplate ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.teams.set(team.id, team);
    return team;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam: Team = { ...team, ...teamUpdate, updatedAt: new Date() };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const match: Match = { 
      ...insertMatch, 
      id: this.currentMatchId++,
      userId: insertMatch.userId,
      name: insertMatch.name ?? null,
      homeTeamId: insertMatch.homeTeamId ?? null,
      awayTeamId: insertMatch.awayTeamId ?? null,
      format: insertMatch.format ?? 5,
      currentSet: insertMatch.currentSet ?? 1,
      homeSetsWon: insertMatch.homeSetsWon ?? 0,
      awaySetsWon: insertMatch.awaySetsWon ?? 0,
      isComplete: insertMatch.isComplete ?? false,
      status: insertMatch.status ?? "in_progress",
      winner: insertMatch.winner ?? null,
      setHistory: (insertMatch.setHistory ?? []) as Array<{setNumber: number, homeScore: number, awayScore: number, winner: 'home' | 'away' | null}>,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPlayed: new Date()
    };
    this.matches.set(match.id, match);
    this.currentMatchIdActive = match.id;
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async updateMatch(id: number, matchUpdate: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch: Match = { ...match, ...matchUpdate, updatedAt: new Date() };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async getCurrentMatch(): Promise<Match | undefined> {
    return this.currentMatchIdActive ? this.matches.get(this.currentMatchIdActive) : undefined;
  }

  async createGameState(insertState: InsertGameState): Promise<GameState> {
    const state: GameState = { 
      ...insertState, 
      id: this.currentGameStateId++,
      matchId: insertState.matchId ?? null,
      homeScore: insertState.homeScore ?? 0,
      awayScore: insertState.awayScore ?? 0,
      theme: insertState.theme ?? "default",
      displayOptions: insertState.displayOptions ?? { showSetHistory: true, showSponsors: true, showTimer: false },
      updatedAt: new Date()
    };
    this.gameStates.set(state.matchId!, state);
    return state;
  }

  async getGameState(matchId: number): Promise<GameState | undefined> {
    return this.gameStates.get(matchId);
  }

  async updateGameState(matchId: number, stateUpdate: Partial<InsertGameState>): Promise<GameState | undefined> {
    const state = this.gameStates.get(matchId);
    if (!state) return undefined;
    
    const updatedState: GameState = { ...state, ...stateUpdate, updatedAt: new Date() };
    this.gameStates.set(matchId, updatedState);
    return updatedState;
  }

  async getSettings(): Promise<Settings> {
    return this.settingsData;
  }

  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    this.settingsData = { ...this.settingsData, ...settingsUpdate, updatedAt: new Date() };
    return this.settingsData;
  }
}

export const storage = new MemStorage();
