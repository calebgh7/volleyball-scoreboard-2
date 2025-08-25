import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { loginUser, registerUser, logoutUser, authenticateUser } from "./auth-simple.js";
import { authenticateToken, optionalAuth } from "./auth-middleware.js";
import { databaseStorage } from "./database-storage.js";
import { cloudStorage } from "./cloud-storage.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database connection
async function initializeServer() {
  try {
    if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
      console.log('🔄 Initializing database connection...');
      const { initializeDatabase } = await import('./database.js');
      await initializeDatabase();
      console.log('✅ Database connection established');
    } else {
      console.log('⚠️ No database URL provided, using in-memory storage');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.log('🔄 Continuing with in-memory storage for development');
  }
}

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Simple in-memory storage
const storage = {
  teams: new Map(),
  matches: new Map(),
  gameStates: new Map(),
  templates: new Map(),
  settings: {
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
  }
};

// Initialize with default data
(function initializeStorage() {
  // Default teams
  const homeTeam = {
    id: 1,
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
  
  const awayTeam = {
    id: 2,
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
  
  storage.teams.set(homeTeam.id, homeTeam);
  storage.teams.set(awayTeam.id, awayTeam);
  
  // Default match
  const match = {
    id: 1,
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
  
  storage.matches.set(match.id, match);
  
  // Default game state
  const gameState = {
    id: 1,
    matchId: match.id,
    homeScore: 0,
    awayScore: 0,
    theme: "default",
    displayOptions: { showSetHistory: true, showSponsors: true, showTimer: false },
    updatedAt: new Date()
  };
  
  storage.gameStates.set(match.id, gameState);
})();

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await registerUser({ email, password, name });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await logoutUser(token);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Logout failed" });
  }
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/current-match", optionalAuth, async (req, res) => {
  try {
    let match, homeTeam, awayTeam, gameState;
    
    if (req.user) {
      // Authenticated user - get their current match
      match = await databaseStorage.getCurrentMatch(req.user.id);
      if (match) {
        homeTeam = await databaseStorage.findTeamById(match.homeTeamId);
        awayTeam = await databaseStorage.findTeamById(match.awayTeamId);
        gameState = await databaseStorage.findGameStateByMatchId(match.id);
      }
    } else {
      // Unauthenticated user - get default match
      match = storage.matches.get(1);
      if (match) {
        homeTeam = storage.teams.get(match.homeTeamId);
        awayTeam = storage.teams.get(match.awayTeamId);
        gameState = storage.gameStates.get(match.id);
      }
    }

    if (!match) {
      return res.status(404).json({ message: "No current match found" });
    }

    if (!homeTeam || !awayTeam || !gameState) {
      return res.status(500).json({ message: "Match data incomplete" });
    }

    res.json({
      match,
      homeTeam,
      awayTeam,
      gameState
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get current match" });
  }
});

app.patch("/api/game-state/:matchId", async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const updates = req.body;
    
    const currentState = storage.gameStates.get(matchId);
    if (!currentState) {
      return res.status(404).json({ message: "Game state not found" });
    }
    
    const updatedState = { ...currentState, ...updates, updatedAt: new Date() };
    storage.gameStates.set(matchId, updatedState);
    
    res.json(updatedState);
  } catch (error) {
    res.status(500).json({ message: "Failed to update game state" });
  }
});

app.get("/api/matches/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const match = storage.matches.get(id);
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to get match" });
  }
});

app.patch("/api/matches/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const currentMatch = storage.matches.get(id);
    if (!currentMatch) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    const updatedMatch = { ...currentMatch, ...updates, updatedAt: new Date() };
    storage.matches.set(id, updatedMatch);
    
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: "Failed to update match" });
  }
});

app.post("/api/matches/:id/reset", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const match = storage.matches.get(id);
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Reset match to initial state
    const resetMatch = { 
      ...match, 
      currentSet: 1,
      homeSetsWon: 0,
      awaySetsWon: 0,
      isComplete: false,
      status: "in_progress",
      winner: null,
      setHistory: [],
      updatedAt: new Date()
    };
    
    storage.matches.set(id, resetMatch);
    
    // Reset game state
    const gameState = storage.gameStates.get(id);
    if (gameState) {
      const resetGameState = { 
        ...gameState, 
        homeScore: 0, 
        awayScore: 0, 
        updatedAt: new Date() 
      };
      storage.gameStates.set(id, resetGameState);
    }
    
    res.json({ message: "Match reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset match" });
  }
});

app.get("/api/teams/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const team = storage.teams.get(id);
    
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Failed to get team" });
  }
});

app.patch("/api/teams/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const currentTeam = storage.teams.get(id);
    if (!currentTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const updatedTeam = { ...currentTeam, ...updates, updatedAt: new Date() };
    storage.teams.set(id, updatedTeam);
    
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: "Failed to update team" });
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    res.json(storage.settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get settings" });
  }
});

app.patch("/api/settings", async (req, res) => {
  try {
    const updates = req.body;
    storage.settings = { ...storage.settings, ...updates, updatedAt: new Date() };
    res.json(storage.settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// Scoreboard Template Routes
app.post("/api/templates", authenticateToken, async (req, res) => {
  try {
    const { name, description, homeTeamId, awayTeamId, settings } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Template name is required" });
    }
    
    const template = await databaseStorage.createTemplate({
      userId: req.user!.id,
      name,
      description,
      homeTeamId,
      awayTeamId,
      settings,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/templates", optionalAuth, async (req, res) => {
  try {
    let templates = [];
    
    if (req.user) {
      // Authenticated user - get their templates + public ones
      const userTemplates = await databaseStorage.getTemplatesByUserId(req.user.id);
      const publicTemplates = await databaseStorage.getPublicTemplates();
      templates = [...userTemplates, ...publicTemplates];
    } else {
      // Show only public templates for unauthenticated users
      templates = await databaseStorage.getPublicTemplates();
    }
    
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/templates/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const template = await databaseStorage.findTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Check if user can access this template
    if (!template.isPublic && req.user?.id !== template.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/templates/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const template = await databaseStorage.findTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Check if user owns this template
    if (template.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const updates = req.body;
    const updatedTemplate = await databaseStorage.updateTemplate(id, updates);
    
    res.json(updatedTemplate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/templates/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const template = await databaseStorage.findTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Check if user owns this template
    if (template.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await databaseStorage.deleteTemplate(id);
    res.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Image Upload Routes
app.post("/api/upload/logo", authenticateToken, async (req, res) => {
  try {
    const { imageData, filename, teamId } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ message: "Image data and filename are required" });
    }

    // Check if Cloudinary is configured
    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ message: "Cloud storage not configured" });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/logos/${req.user!.id}`,
      transformation: {
        width: 512,
        height: 512,
        crop: 'limit',
        quality: 'auto'
      }
    });

    // Update team with logo information
    if (teamId) {
      await databaseStorage.updateTeam(teamId, {
        logoPublicId: uploadResult.publicId
      });
    }

    res.json({
      message: "Logo uploaded successfully",
      logo: {
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        thumbnailUrl: cloudStorage.generateThumbnailUrl(uploadResult.publicId, 150)
      }
    });
  } catch (error: any) {
    console.error('Logo upload failed:', error);
    res.status(500).json({ message: error.message || "Logo upload failed" });
  }
});

app.post("/api/upload/sponsor", authenticateToken, async (req, res) => {
  try {
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ message: "Image data and filename are required" });
    }

    // Check if Cloudinary is configured
    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ message: "Cloud storage not configured" });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/sponsors/${req.user!.id}`,
      transformation: {
        width: 800,
        height: 400,
        crop: 'limit',
        quality: 'auto'
      }
    });

    // Update user settings with sponsor logo
    await databaseStorage.updateSettings(req.user!.id, {
      sponsorLogoPublicId: uploadResult.publicId
    });

    res.json({
      message: "Sponsor logo uploaded successfully",
      logo: {
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        thumbnailUrl: cloudStorage.generateThumbnailUrl(uploadResult.publicId, 300)
      }
    });
  } catch (error: any) {
    console.error('Sponsor logo upload failed:', error);
    res.status(500).json({ message: error.message || "Sponsor logo upload failed" });
  }
});

app.delete("/api/upload/:publicId", authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Check if Cloudinary is configured
    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ message: "Cloud storage not configured" });
    }

    // Delete image from Cloudinary
    const deleted = await cloudStorage.deleteImage(publicId);
    
    if (deleted) {
      res.json({ message: "Image deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete image" });
    }
  } catch (error: any) {
    console.error('Image deletion failed:', error);
    res.status(500).json({ message: error.message || "Image deletion failed" });
  }
});

// API-only server - Vercel handles static files
app.use("*", (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return next();
  }
  res.status(404).json({ 
    message: "Not Found", 
    available: ["/api/health", "/api/current-match", "/api/game-state/:matchId", "/api/matches/:id", "/api/teams/:id", "/api/settings"],
    note: "This is an API-only server. The client application is served by Vercel."
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ message });
  console.error('Error:', err);
});

// Start server
const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0';

const server = createServer(app);

server.listen({
  port,
  host,
}, async () => {
  console.log(`🚀 Server running on ${host}:${port}`);
  console.log(`📊 API available at http://${host}:${port}/api`);
  console.log(`🌐 Health check: http://${host}:${port}/api/health`);
  
  // Initialize database
  await initializeServer();
});

export default app;
