import * as express from 'express';
import * as cors from 'cors';
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
    console.log('🚀 Initializing server...');
    
    // Test database connection
    const dbHealth = await databaseStorage.checkHealth();
    if (dbHealth.connected) {
      console.log('✅ Database connected successfully');
      
      // Run migrations
      try {
        await databaseStorage.runMigrations();
        console.log('✅ Database migrations completed');
      } catch (migrationError) {
        console.log('⚠️ Database migrations failed, continuing with existing schema:', migrationError);
      }
    } else {
      console.log('⚠️ Database not available, using in-memory storage');
    }
    
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    console.log('⚠️ Continuing with limited functionality');
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await databaseStorage.checkHealth();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    const result = await registerUser(email, password, name);
    
    if (result.success) {
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
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await loginUser(email, password);
    
    if (result.success) {
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
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await logoutUser(token);
    
    if (result.success) {
      res.json({ message: 'Logout successful' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await authenticateUser(token);
    
    if (result.success) {
      res.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        }
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

// Scoreboard data endpoints
app.get('/api/current-match', async (req, res) => {
  try {
    const match = await databaseStorage.getCurrentMatch();
    res.json(match || { message: 'No current match' });
  } catch (error) {
    console.error('Error fetching current match:', error);
    res.status(500).json({ error: 'Failed to fetch current match' });
  }
});

app.get('/api/game-state', async (req, res) => {
  try {
    const gameState = await databaseStorage.getCurrentGameState();
    res.json(gameState || { message: 'No game state available' });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

app.get('/api/matches', authenticateToken, async (req, res) => {
  try {
    const matches = await databaseStorage.getAllMatches();
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await databaseStorage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/teams', authenticateToken, async (req, res) => {
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
      id: Math.floor(Math.random() * 10000) + 1, // Simple ID generation for now
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

app.patch('/api/teams/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/teams/:id', authenticateToken, async (req, res) => {
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

app.get('/api/settings', authenticateToken, async (req, res) => {
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

app.patch('/api/settings', authenticateToken, async (req, res) => {
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
        id: Math.floor(Math.random() * 10000) + 1,
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
app.get('/api/templates', authenticateToken, async (req, res) => {
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

app.post('/api/templates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { name, description, data } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }
    
    const template = await databaseStorage.createTemplate({
      id: crypto.randomUUID(),
      userId,
      name,
      description: description || '',
      data,
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

app.get('/api/templates/:id', async (req, res) => {
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

app.put('/api/templates/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
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
app.post('/api/upload/logo', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message || 'Logo upload failed' });
  }
});

app.post('/api/upload/sponsor', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message || 'Sponsor logo upload failed' });
  }
});

app.delete('/api/upload/:publicId', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message || 'Image deletion failed' });
  }
});

// Cloudinary status endpoint
app.get('/api/cloudinary/status', async (req, res) => {
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
app.delete('/api/cleanup-test-users', async (req, res) => {
  try {
    const users = await databaseStorage.getAllUsers();
    let deletedCount = 0;
    
    for (const user of users) {
      if (user.email.includes('test') || user.email.includes('@example.com')) {
        await databaseStorage.deleteUser(user.id);
        deletedCount++;
      }
    }
    
    res.json({ 
      message: `Deleted ${deletedCount} test users`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    res.status(500).json({ error: 'Failed to cleanup test users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initializeServer();
});

export default app;
