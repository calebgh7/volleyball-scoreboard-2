import { eq, and, desc } from 'drizzle-orm';
import { 
  teams, matches, gameState, settings, users, userSessions, scoreboardTemplates,
  type InsertTeam, type InsertMatch, type InsertGameState, type InsertSettings,
  type InsertUser, type InsertUserSession, type InsertScoreboardTemplate
} from '../shared/schema.js';

// Lazy database connection
let db: any = null;
let dbInitialized = false;

async function getDb() {
  if (!dbInitialized) {
    try {
      const { db: databaseInstance } = await import('./database.js');
      db = databaseInstance;
      dbInitialized = true;
    } catch (error) {
      console.log('Database not available, using in-memory fallback');
      return null;
    }
  }
  return db;
}

export class DatabaseStorage {
  // Health check
  async checkHealth() {
    try {
      const database = await getDb();
      if (!database) {
        return { connected: false, status: 'Database not available' };
      }
      
      // Test connection with a simple query
      await database.select().from(users).limit(1);
      return { connected: true, status: 'Connected' };
    } catch (error) {
      return { connected: false, status: 'Connection failed', error: error.message };
    }
  }

  // Run migrations
  async runMigrations() {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      // For now, just return success - migrations would be handled by drizzle-kit
      return true;
    } catch (error) {
      throw new Error('Failed to run migrations: ' + error.message);
    }
  }

  // User Management
  async createUser(userData: InsertUser) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newUser] = await database.insert(users).values(userData).returning();
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [user] = await database.select().from(users).where(eq(users.email, email));
      return user || null;
    } catch (error) {
      console.error('Failed to find user by email:', error);
      return null;
    }
  }

  async findUserById(id: string) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [user] = await database.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error('Failed to find user by ID:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedUser] = await database
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
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newSession] = await database.insert(userSessions).values(sessionData).returning();
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Failed to create session');
    }
  }

  async findSession(token: string) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [session] = await database.select().from(userSessions).where(eq(userSessions.token, token));
      return session || null;
    } catch (error) {
      console.error('Failed to find session:', error);
      return null;
    }
  }

  async deleteSession(token: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(userSessions).where(eq(userSessions.token, token));
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  // Team Management
  async createTeam(teamData: InsertTeam) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newTeam] = await database.insert(teams).values(teamData).returning();
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw new Error('Failed to create team');
    }
  }

  async findTeamById(id: number) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [team] = await database.select().from(teams).where(eq(teams.id, id));
      return team || null;
    } catch (error) {
      console.error('Failed to find team by ID:', error);
      return null;
    }
  }

  async updateTeam(id: number, updates: Partial<InsertTeam>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedTeam] = await database
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

  async getAllTeams() {
    try {
      const database = await getDb();
      if (!database) {
        return [];
      }
      
      return await database.select().from(teams).orderBy(teams.name);
    } catch (error) {
      console.error('Failed to get all teams:', error);
      return [];
    }
  }

  // Match Management
  async createMatch(matchData: InsertMatch) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newMatch] = await database.insert(matches).values(matchData).returning();
      return newMatch;
    } catch (error) {
      console.error('Failed to create match:', error);
      throw new Error('Failed to create match');
    }
  }

  async findMatchById(id: number) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [match] = await database.select().from(matches).where(eq(matches.id, id));
      return match || null;
    } catch (error) {
      console.error('Failed to find match by ID:', error);
      return null;
    }
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedMatch] = await database
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

  async getCurrentMatch() {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [match] = await database
        .select()
        .from(matches)
        .where(eq(matches.status, 'in_progress'))
        .orderBy(desc(matches.updatedAt))
        .limit(1);
      return match || null;
    } catch (error) {
      console.error('Failed to get current match:', error);
      return null;
    }
  }

  async getAllMatches() {
    try {
      const database = await getDb();
      if (!database) {
        return [];
      }
      
      return await database.select().from(matches).orderBy(desc(matches.updatedAt));
    } catch (error) {
      console.error('Failed to get all matches:', error);
      return [];
    }
  }

  // Game State Management
  async createGameState(gameStateData: InsertGameState) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newGameState] = await database.insert(gameState).values(gameStateData).returning();
      return newGameState;
    } catch (error) {
      console.error('Failed to create game state:', error);
      throw new Error('Failed to create game state');
    }
  }

  async findGameStateByMatchId(matchId: number) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [state] = await database.select().from(gameState).where(eq(gameState.matchId, matchId));
      return state || null;
    } catch (error) {
      console.error('Failed to find game state by match ID:', error);
      return null;
    }
  }

  async updateGameState(matchId: number, updates: Partial<InsertGameState>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedState] = await database
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

  async getCurrentGameState() {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const currentMatch = await this.getCurrentMatch();
      if (!currentMatch) {
        return null;
      }
      
      return await this.findGameStateByMatchId(currentMatch.id);
    } catch (error) {
      console.error('Failed to get current game state:', error);
      return null;
    }
  }

  // Settings Management
  async createSettings(settingsData: InsertSettings) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newSettings] = await database.insert(settings).values(settingsData).returning();
      return newSettings;
    } catch (error) {
      console.error('Failed to create settings:', error);
      throw new Error('Failed to create settings');
    }
  }

  async findSettingsByUserId(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [userSettings] = await database.select().from(settings).where(eq(settings.userId, userId));
      return userSettings || null;
    } catch (error) {
      console.error('Failed to find settings by user ID:', error);
      return null;
    }
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedSettings] = await database
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
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [newTemplate] = await database.insert(scoreboardTemplates).values(templateData).returning();
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw new Error('Failed to create template');
    }
  }

  async findTemplateById(id: string) {
    try {
      const database = await getDb();
      if (!database) {
        return null;
      }
      
      const [template] = await database.select().from(scoreboardTemplates).where(eq(scoreboardTemplates.id, id));
      return template || null;
    } catch (error) {
      console.error('Failed to find template by ID:', error);
      return null;
    }
  }

  async updateTemplate(id: string, updates: Partial<InsertScoreboardTemplate>) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      const [updatedTemplate] = await database
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

  async deleteTemplate(id: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(scoreboardTemplates).where(eq(scoreboardTemplates.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  async getTemplatesByUserId(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return [];
      }
      
      return await database
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
      const database = await getDb();
      if (!database) {
        return [];
      }
      
      return await database
        .select()
        .from(scoreboardTemplates)
        .where(eq(scoreboardTemplates.isPublic, true))
        .orderBy(desc(scoreboardTemplates.updatedAt));
    } catch (error) {
      console.error('Failed to get public templates:', error);
      return [];
    }
  }

  // Initialize user data
  async initializeUserData(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        console.log('Database not available, skipping user data initialization');
        return;
      }
      
      // Create default teams for the user
      const homeTeam = await this.createTeam({
        id: 1,
        userId,
        name: 'HOME TEAM',
        location: 'Home',
        logoPath: null,
        logoPublicId: null,
        colorScheme: 'blue',
        customColor: null,
        customTextColor: '#FFFFFF',
        customSetBackgroundColor: '#000000',
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const awayTeam = await this.createTeam({
        id: 2,
        userId,
        name: 'AWAY TEAM',
        location: 'Away',
        logoPath: null,
        logoPublicId: null,
        colorScheme: 'red',
        customColor: null,
        customTextColor: '#FFFFFF',
        customSetBackgroundColor: '#000000',
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create default match
      const match = await this.createMatch({
        id: 1,
        userId,
        name: 'New Match',
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
        id: 1,
        matchId: match.id,
        homeScore: 0,
        awayScore: 0,
        theme: 'default',
        displayOptions: { showSetHistory: true, showSponsors: true, showTimer: false },
        updatedAt: new Date()
      });

      // Create default settings
      await this.createSettings({
        id: 1,
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

      console.log('✅ User data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize user data:', error);
    }
  }

  // Cleanup methods
  async getAllUsers() {
    try {
      const database = await getDb();
      if (!database) {
        return [];
      }
      
      return await database.select().from(users);
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

  async deleteUser(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(users).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  async deleteUserSessions(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(userSessions).where(eq(userSessions.userId, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user sessions:', error);
      return false;
    }
  }

  async deleteUserSettings(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(settings).where(eq(settings.userId, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user settings:', error);
      return false;
    }
  }

  async deleteUserTemplates(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(scoreboardTemplates).where(eq(scoreboardTemplates.userId, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user templates:', error);
      return false;
    }
  }

  async deleteUserMatches(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(matches).where(eq(matches.userId, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user matches:', error);
      return false;
    }
  }

  async deleteUserTeams(userId: string) {
    try {
      const database = await getDb();
      if (!database) {
        return false;
      }
      
      await database.delete(teams).where(eq(teams.userId, userId));
      return true;
    } catch (error) {
      console.error('Failed to delete user teams:', error);
      return false;
    }
  }
}

export const databaseStorage = new DatabaseStorage();
