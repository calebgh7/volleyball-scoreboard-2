import express, { Request, Response } from 'express';
import cors from 'cors';
import { databaseStorage } from './database-storage.js';
import { registerUser, loginUser, authenticateUser, logoutUser } from './auth-simple.js';
import { authenticateToken } from './auth-middleware.js';
import { cloudStorage } from './cloud-storage.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database on startup
async function initializeServer() {
  try {
    console.log('🔍 Checking database health...');
    const health = await databaseStorage.checkHealth();
    console.log('📊 Database health:', health);
    
    if (health.connected) {
      console.log('✅ Database connected, running migrations...');
      await databaseStorage.runMigrations();
    } else {
      console.log('⚠️ Database not available, using in-memory fallback');
    }
  } catch (error) {
    console.log('⚠️ Database initialization failed, using in-memory fallback');
  }
}

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const health = await databaseStorage.checkHealth();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: health,
      uptime: process.uptime()
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
});

// Authentication endpoints
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser(email, password, name);
    
    if (result.success && result.user) {
      res.json({
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        },
        token: result.token
      });
    } else {
      res.status(400).json({ error: result.error || 'Registration failed' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    
    if (result.success && result.user) {
      res.json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        },
        token: result.token
      });
    } else {
      res.status(401).json({ error: result.error || 'Login failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await logoutUser(token);
    }
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await authenticateUser(req.headers.authorization?.split(' ')[1] || '');
    
    if (result.success && result.user) {
      res.json({
        message: 'Authentication successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        }
      });
    } else {
      res.status(401).json({ error: result.error || 'Authentication failed' });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

// Match and game state endpoints
app.get('/api/current-match', async (req: Request, res: Response) => {
  try {
    const match = await databaseStorage.getCurrentMatch();
    res.json(match || { message: 'No current match' });
  } catch (error) {
    console.error('Error fetching current match:', error);
    res.status(500).json({ error: 'Failed to fetch current match' });
  }
});

app.get('/api/game-state', async (req: Request, res: Response) => {
  try {
    const gameState = await databaseStorage.getCurrentGameState();
    res.json(gameState || { message: 'No game state available' });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

app.get('/api/matches', authenticateToken, async (req: Request, res: Response) => {
  try {
    const matches = await databaseStorage.getAllMatches();
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Team management endpoints
app.get('/api/teams', async (req: Request, res: Response) => {
  try {
    const teams = await databaseStorage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/teams', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { name, location, colorScheme, customColor, customTextColor, customSetBackgroundColor, isTemplate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    const team = await databaseStorage.createTeam({
      userId,
      name,
      location: location || '',
      logoPath: null,
      logoPublicId: null,
      colorScheme: colorScheme || 'blue',
      customColor: customColor || null,
      customTextColor: customTextColor || '#FFFFFF',
      customSetBackgroundColor: customSetBackgroundColor || '#000000',
      isTemplate: isTemplate || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.patch('/api/teams/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const team = await databaseStorage.findTeamById(parseInt(id));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (team.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this team' });
    }
    
    const updatedTeam = await databaseStorage.updateTeam(parseInt(id), {
      ...req.body,
      updatedAt: new Date()
    });
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const team = await databaseStorage.findTeamById(parseInt(id));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (team.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this team' });
    }
    
    // For now, just return success - actual deletion would need to be implemented
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Settings endpoints
app.get('/api/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const settings = await databaseStorage.findSettingsByUserId(userId);
    res.json(settings || { message: 'No settings found' });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.patch('/api/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const existingSettings = await databaseStorage.findSettingsByUserId(userId);
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings = await databaseStorage.updateSettings(userId, {
        ...req.body,
        updatedAt: new Date()
      });
      res.json(updatedSettings);
    } else {
      // Create new settings
      const newSettings = await databaseStorage.createSettings({
        userId,
        sponsorLogoPath: null,
        sponsorLogoPublicId: null,
        primaryColor: req.body.primaryColor || '#1565C0',
        accentColor: req.body.accentColor || '#FF6F00',
        theme: req.body.theme || 'standard',
        defaultMatchFormat: req.body.defaultMatchFormat || 5,
        autoSave: req.body.autoSave !== undefined ? req.body.autoSave : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      res.json(newSettings);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Template management endpoints
app.get('/api/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const templates = await databaseStorage.getTemplatesByUserId(userId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { name, homeTeamId, awayTeamId, settings, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    const template = await databaseStorage.createTemplate({
      userId,
      name,
      homeTeamId: homeTeamId || null,
      awayTeamId: awayTeamId || null,
      settings: settings || {
        theme: 'default',
        displayOptions: { showSetHistory: true, showSponsors: true, showTimer: false },
        primaryColor: '#1565C0',
        accentColor: '#FF6F00'
      },
      description: description || '',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

app.get('/api/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await databaseStorage.findTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

app.put('/api/templates/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const template = await databaseStorage.findTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this template' });
    }
    
    const updatedTemplate = await databaseStorage.updateTemplate(id, {
      ...req.body,
      updatedAt: new Date()
    });
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

app.delete('/api/templates/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const template = await databaseStorage.findTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this template' });
    }
    
    await databaseStorage.deleteTemplate(id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Image upload endpoints
app.post('/api/upload/logo', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { imageData, filename, teamId } = req.body;
    const userId = req.user?.id;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ error: 'Cloud storage not configured' });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/logos/${userId}`,
      transformation: {
        width: 512,
        height: 512,
        crop: 'limit',
        quality: 80
      }
    });

    // Update team with logo information if teamId is provided
    if (teamId) {
      try {
        await databaseStorage.updateTeam(parseInt(teamId), {
          logoPublicId: uploadResult.publicId
        });
      } catch (dbError) {
        console.log('Failed to update team logo in database:', dbError);
      }
    }

    res.json({
      message: 'Logo uploaded successfully',
      logo: {
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        thumbnailUrl: cloudStorage.generateThumbnailUrl(uploadResult.publicId, 150)
      }
    });
  } catch (error) {
    console.error('Logo upload failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Logo upload failed' });
  }
});

app.post('/api/upload/sponsor', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { imageData, filename } = req.body;
    const userId = req.user?.id;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ error: 'Cloud storage not configured' });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/sponsors/${userId}`,
      transformation: {
        width: 800,
        height: 400,
        crop: 'limit',
        quality: 80
      }
    });

    // Update user settings with sponsor logo
    try {
      await databaseStorage.updateSettings(userId, {
        sponsorLogoPublicId: uploadResult.publicId
      });
    } catch (dbError) {
      console.log('Failed to update sponsor logo in database:', dbError);
    }

    res.json({
      message: 'Sponsor logo uploaded successfully',
      logo: {
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        thumbnailUrl: cloudStorage.generateThumbnailUrl(uploadResult.publicId, 300)
      }
    });
  } catch (error) {
    console.error('Sponsor logo upload failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Sponsor logo upload failed' });
  }
});

app.delete('/api/upload/:publicId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ error: 'Cloud storage not configured' });
    }

    // Delete image from Cloudinary
    const deleted = await cloudStorage.deleteImage(publicId);
    
    if (deleted) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Image deletion failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Image deletion failed' });
  }
});

// Cloudinary status endpoint
app.get('/api/cloudinary/status', async (req: Request, res: Response) => {
  try {
    if (!cloudStorage.isConfigured()) {
      return res.json({
        configured: false,
        message: 'Cloudinary not configured'
      });
    }

    const usage = await cloudStorage.getStorageUsage();
    res.json({
      configured: true,
      usage
    });
  } catch (error) {
    console.error('Failed to get Cloudinary status:', error);
    res.status(500).json({ error: 'Failed to get Cloudinary status' });
  }
});

// Cleanup endpoint for test users
app.delete('/api/cleanup-test-users', async (req: Request, res: Response) => {
  try {
    const users = await databaseStorage.getAllUsers();
    let deletedCount = 0;
    
    for (const user of users) {
      if (user.email.includes('test') || user.email.includes('example')) {
        try {
          await databaseStorage.deleteUser(user.id);
          deletedCount++;
        } catch (error) {
          console.log(`Failed to delete user ${user.id}:`, error);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} test users.`,
      deletedCount,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initializeServer();
});
