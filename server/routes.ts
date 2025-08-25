import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertTeamSchema, insertMatchSchema, insertGameStateSchema, insertSettingsSchema } from "../shared/schema";

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for high-quality logos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get current match with teams and game state
  app.get("/api/current-match", async (req, res) => {
    try {
      const match = await storage.getCurrentMatch();
      if (!match) {
        return res.status(404).json({ message: "No active match found" });
      }
      
      const homeTeam = await storage.getTeam(match.homeTeamId!);
      const awayTeam = await storage.getTeam(match.awayTeamId!);
      const gameState = await storage.getGameState(match.id);
      
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

  // Update game state (scores)
  app.patch("/api/game-state/:matchId", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const updates = req.body;
      
      const updatedState = await storage.updateGameState(matchId, updates);
      if (!updatedState) {
        return res.status(404).json({ message: "Game state not found" });
      }
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game state" });
    }
  });

  // Get match by ID
  app.get("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to get match" });
    }
  });

  // Update match data
  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedMatch = await storage.updateMatch(id, updates);
      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Update team data
  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTeam = await storage.updateTeam(id, updates);
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {
        id: 1,
        sponsorLogoPath: null,
        primaryColor: "#1565C0",
        accentColor: "#FF6F00",
        theme: "standard"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  // Update settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateSettings(updates);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Upload sponsor logo
  app.post("/api/settings/sponsor-logo", upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const logoPath = `/uploads/${req.file.filename}`;
      await storage.updateSettings({ sponsorLogoPath: logoPath });
      
      res.json({ logoPath });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload sponsor logo" });
    }
  });

  // Upload team logo
  app.post("/api/teams/:id/logo", upload.single('logo'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const logoPath = `/uploads/${req.file.filename}`;
      const updatedTeam = await storage.updateTeam(id, { logoPath });
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json({ logoPath });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Upload sponsor logo
  app.post("/api/settings/sponsor-logo", upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const sponsorLogoPath = `/uploads/${req.file.filename}`;
      const updatedSettings = await storage.updateSettings({ sponsorLogoPath });
      
      res.json({ sponsorLogoPath });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload sponsor logo" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  // Update settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateSettings(updates);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Create new match
  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const newMatch = await storage.createMatch(matchData);
      
      // Create initial game state
      await storage.createGameState({
        matchId: newMatch.id,
        homeScore: 0,
        awayScore: 0,
        displayOptions: {
          showSetHistory: true,
          showSponsors: true,
          showTimer: false
        }
      });
      
      res.json(newMatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  // Reset match
  app.post("/api/matches/:id/reset", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Reset match data
      const resetMatch = await storage.updateMatch(id, {
        currentSet: 1,
        homeSetsWon: 0,
        awaySetsWon: 0,
        isComplete: false,
        setHistory: []
      });
      
      if (!resetMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Reset game state
      await storage.updateGameState(id, {
        homeScore: 0,
        awayScore: 0
      });
      
      res.json({ message: "Match reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset match" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
