import { eq, and, desc } from 'drizzle-orm';
import { db } from './database.js';
import { 
  teams, matches, gameState, settings, users, userSessions, scoreboardTemplates,
  type InsertTeam, type InsertMatch, type InsertGameState, type InsertSettings,
  type InsertUser, type InsertUserSession, type InsertScoreboardTemplate
} from '../shared/schema.js';

export class DatabaseStorage {
  // User Management
  async createUser(userData: InsertUser) {
    try {
      const [newUser] = await db.insert(users).values(userData).returning();
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || null;
    } catch (error) {
      console.error('Failed to find user by email:', error);
      return null;
    }
  }

  async findUserById(id: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error('Failed to find user by ID:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>) {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Session Management
  async createSession(sessionData: InsertUserSession) {
    try {
      const [newSession] = await db.insert(userSessions).values(sessionData).returning();
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Failed to create session');
    }
  }

  async findSession(token: string) {
    try {
      const [session] = await db.select().from(userSessions).where(eq(userSessions.token, token));
      return session || null;
    } catch (error) {
      console.error('Failed to find session:', error);
      return null;
    }
  }

  async deleteSession(token: string) {
    try {
      await db.delete(userSessions).where(eq(userSessions.token, token));
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  // Team Management
  async createTeam(teamData: InsertTeam) {
    try {
      const [newTeam] = await db.insert(teams).values(teamData).returning();
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw new Error('Failed to create team');
    }
  }

  async findTeamById(id: number) {
    try {
      const [team] = await db.select().from(teams).where(eq(teams.id, id));
      return team || null;
    } catch (error) {
      console.error('Failed to find team by ID:', error);
      return null;
    }
  }

  async updateTeam(id: number, updates: Partial<InsertTeam>) {
    try {
      const [updatedTeam] = await db
        .update(teams)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(teams.id, id))
        .returning();
      return updatedTeam;
    } catch (error) {
      console.error('Failed to update team:', error);
      throw new Error('Failed to update team');
    }
  }

  async getAllTeams(userId: string) {
    try {
      return await db.select().from(teams).where(eq(teams.userId, userId));
    } catch (error) {
      console.error('Failed to get teams:', error);
      return [];
    }
  }

  // Match Management
  async createMatch(matchData: InsertMatch) {
    try {
      const [newMatch] = await db.insert(matches).values(matchData).returning();
      return newMatch;
    } catch (error) {
      console.error('Failed to create match:', error);
      throw new Error('Failed to create match');
    }
  }

  async findMatchById(id: number) {
    try {
      const [match] = await db.select().from(matches).where(eq(matches.id, id));
      return match || null;
    } catch (error) {
      console.error('Failed to find match by ID:', error);
      return null;
    }
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>) {
    try {
      const [updatedMatch] = await db
        .update(matches)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(matches.id, id))
        .returning();
      return updatedMatch;
    } catch (error) {
      console.error('Failed to update match:', error);
      throw new Error('Failed to update match');
    }
  }

  async getCurrentMatch(userId: string) {
    try {
      const [match] = await db
        .select()
        .from(matches)
        .where(and(eq(matches.userId, userId), eq(matches.isComplete, false)))
        .orderBy(desc(matches.updatedAt))
        .limit(1);
      return match || null;
    } catch (error) {
      console.error('Failed to get current match:', error);
      return null;
    }
  }

  async getAllMatches(userId: string) {
    try {
      return await db
        .select()
        .from(matches)
        .where(eq(matches.userId, userId))
        .orderBy(desc(matches.updatedAt));
    } catch (error) {
      console.error('Failed to get matches:', error);
      return [];
    }
  }

  // Game State Management
  async createGameState(gameStateData: InsertGameState) {
    try {
      const [newGameState] = await db.insert(gameState).values(gameStateData).returning();
      return newGameState;
    } catch (error) {
      console.error('Failed to create game state:', error);
      throw new Error('Failed to create game state');
    }
  }

  async findGameStateByMatchId(matchId: number) {
    try {
      const [state] = await db.select().from(gameState).where(eq(gameState.matchId, matchId));
      return state || null;
    } catch (error) {
      console.error('Failed to find game state by match ID:', error);
      return null;
    }
  }

  async updateGameState(matchId: number, updates: Partial<InsertGameState>) {
    try {
      const [updatedState] = await db
        .update(gameState)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(gameState.matchId, matchId))
        .returning();
      return updatedState;
    } catch (error) {
      console.error('Failed to update game state:', error);
      throw new Error('Failed to update game state');
    }
  }

  // Settings Management
  async createSettings(settingsData: InsertSettings) {
    try {
      const [newSettings] = await db.insert(settings).values(settingsData).returning();
      return newSettings;
    } catch (error) {
      console.error('Failed to create settings:', error);
      throw new Error('Failed to create settings');
    }
  }

  async findSettingsByUserId(userId: string) {
    try {
      const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
      return userSettings || null;
    } catch (error) {
      console.error('Failed to find settings by user ID:', error);
      return null;
    }
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>) {
    try {
      const [updatedSettings] = await db
        .update(settings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(settings.userId, userId))
        .returning();
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // Template Management
  async createTemplate(templateData: InsertScoreboardTemplate) {
    try {
      const [newTemplate] = await db.insert(scoreboardTemplates).values(templateData).returning();
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw new Error('Failed to create template');
    }
  }

  async findTemplateById(id: number) {
    try {
      const [template] = await db.select().from(scoreboardTemplates).where(eq(scoreboardTemplates.id, id));
      return template || null;
    } catch (error) {
      console.error('Failed to find template by ID:', error);
      return null;
    }
  }

  async updateTemplate(id: number, updates: Partial<InsertScoreboardTemplate>) {
    try {
      const [updatedTemplate] = await db
        .update(scoreboardTemplates)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(scoreboardTemplates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw new Error('Failed to update template');
    }
  }

  async deleteTemplate(id: number) {
    try {
      await db.delete(scoreboardTemplates).where(eq(scoreboardTemplates.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  async getTemplatesByUserId(userId: string) {
    try {
      return await db
        .select()
        .from(scoreboardTemplates)
        .where(eq(scoreboardTemplates.userId, userId))
        .orderBy(desc(scoreboardTemplates.updatedAt));
    } catch (error) {
      console.error('Failed to get templates by user ID:', error);
      return [];
    }
  }

  async getPublicTemplates() {
    try {
      return await db
        .select()
        .from(scoreboardTemplates)
        .where(eq(scoreboardTemplates.isPublic, true))
        .orderBy(desc(scoreboardTemplates.updatedAt));
    } catch (error) {
      console.error('Failed to get public templates:', error);
      return [];
    }
  }

  // Initialize default data for a new user
  async initializeUserData(userId: string) {
    try {
      // Create default teams
      const homeTeam = await this.createTeam({
        userId,
        name: 'EAGLES',
        location: 'Central High',
        colorScheme: 'purple',
        customTextColor: '#FFFFFF',
        customSetBackgroundColor: '#000000',
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const awayTeam = await this.createTeam({
        userId,
        name: 'TIGERS',
        location: 'North Valley',
        colorScheme: 'blue',
        customTextColor: '#FFFFFF',
        customSetBackgroundColor: '#000000',
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create default match
      const match = await this.createMatch({
        userId,
        name: 'Default Match',
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        format: 5,
        currentSet: 1,
        homeSetsWon: 0,
        awaySetsWon: 0,
        isComplete: false,
        status: 'in_progress',
        winner: null,
        setHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastPlayed: new Date()
      });

      // Create default game state
      await this.createGameState({
        matchId: match.id,
        homeScore: 0,
        awayScore: 0,
        theme: 'default',
        displayOptions: {
          showSetHistory: true,
          showSponsors: true,
          showTimer: false
        },
        updatedAt: new Date()
      });

      // Create default settings
      await this.createSettings({
        userId,
        sponsorLogoPath: null,
        sponsorLogoPublicId: null,
        primaryColor: '#1565C0',
        accentColor: '#FF6F00',
        theme: 'standard',
        defaultMatchFormat: 5,
        autoSave: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Initialized default data for user: ${userId}`);
      return { homeTeam, awayTeam, match };
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      throw new Error('Failed to initialize user data');
    }
  }
}

export const databaseStorage = new DatabaseStorage();
