import type { InsertTeam, InsertMatch, InsertGameState, InsertSettings, Team, Match, GameState, Settings } from '../shared/schema.js';

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
    userId: "default-user-id",
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
      userId: "default-user-id",
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
      userId: "default-user-id",
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
      userId: "default-user-id",
      name: "Default Match",
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      format: 5,
      currentSet: 1,
      homeSetsWon: 0,
      awaySetsWon: 0,
      isComplete: false,
      status: "in_progress",
      winner: null,
      setHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPlayed: new Date()
    };
    
    this.matches.set(match.id, match);
    this.currentMatchIdActive = match.id;
    
    // Initialize default game state
    const state: GameState = {
      id: this.currentGameStateId++,
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
      theme: "default",
      displayOptions: { showSetHistory: true, showSponsors: true, showTimer: false },
      updatedAt: new Date()
    };
    
    this.gameStates.set(match.id, state);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = {
      id: this.currentTeamId++,
      userId: insertTeam.userId ?? "default-user-id",
      name: insertTeam.name ?? "New Team",
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
      userId: insertMatch.userId ?? "default-user-id",
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
    
    // Only update fields that are actually provided and valid
    const updatedMatch: Match = { 
      ...match, 
      ...(matchUpdate.name !== undefined && { name: matchUpdate.name }),
      ...(matchUpdate.homeTeamId !== undefined && { homeTeamId: matchUpdate.homeTeamId }),
      ...(matchUpdate.awayTeamId !== undefined && { awayTeamId: matchUpdate.awayTeamId }),
      ...(matchUpdate.format !== undefined && { format: matchUpdate.format }),
      ...(matchUpdate.currentSet !== undefined && { currentSet: matchUpdate.currentSet }),
      ...(matchUpdate.homeSetsWon !== undefined && { homeSetsWon: matchUpdate.homeSetsWon }),
      ...(matchUpdate.awaySetsWon !== undefined && { awaySetsWon: matchUpdate.awaySetsWon }),
      ...(matchUpdate.isComplete !== undefined && { isComplete: matchUpdate.isComplete }),
      ...(matchUpdate.status !== undefined && { status: matchUpdate.status }),
      ...(matchUpdate.winner !== undefined && { winner: matchUpdate.winner }),
      ...(matchUpdate.setHistory !== undefined && { setHistory: matchUpdate.setHistory as Array<{setNumber: number, homeScore: number, awayScore: number, winner: 'home' | 'away' | null}> }),
      updatedAt: new Date()
    };
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
