import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/current-match", async (req, res) => {
  try {
    const match = storage.matches.get(1); // Get first match
    if (!match) {
      return res.status(404).json({ message: "No active match found" });
    }
    
    const homeTeam = storage.teams.get(match.homeTeamId);
    const awayTeam = storage.teams.get(match.awayTeamId);
    const gameState = storage.gameStates.get(match.id);
    
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  
  try {
    const fs = await import('fs');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      
      // Fall through to index.html for SPA routing
      app.use("*", (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
          return next();
        }
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  } catch (error) {
    console.log('Static files not available, serving API only');
  }
}

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
}, () => {
  console.log(`🚀 Server running on ${host}:${port}`);
  console.log(`📊 API available at http://${host}:${port}/api`);
  console.log(`🌐 Health check: http://${host}:${port}/api/health`);
});

export default app;
