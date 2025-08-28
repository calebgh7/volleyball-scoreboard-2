const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Serverless server running (Vercel format)',
    version: '1.0.2'
  });
});

// Cloudinary status endpoint
app.get('/api/cloudinary/status', async (req, res) => {
  try {
    // For now, return a simple status since we can't import the cloud storage module
    res.json({
      configured: false,
      message: 'Cloudinary integration pending - server deployed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get Cloudinary status:', error);
    res.status(500).json({ error: 'Failed to get Cloudinary status' });
  }
});

// Image upload endpoints (placeholder for now)
app.post('/api/upload/logo', async (req, res) => {
  try {
    const { imageData, filename, teamId } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // For now, just return success to test the endpoint
    res.json({
      message: 'Logo upload endpoint working (Cloudinary integration pending)',
      received: { filename, teamId, hasImageData: !!imageData },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logo upload failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Logo upload failed' });
  }
});

app.post('/api/upload/sponsor', async (req, res) => {
  try {
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // For now, just return success to test the endpoint
    res.json({
      message: 'Sponsor logo upload endpoint working (Cloudinary integration pending)',
      received: { filename, hasImageData: !!imageData },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sponsor logo upload failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Sponsor logo upload failed' });
  }
});

app.delete('/api/upload/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // For now, just return success to test the endpoint
    res.json({ 
      message: 'Image deletion endpoint working (Cloudinary integration pending)',
      received: { publicId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Image deletion failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Image deletion failed' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Serverless server is working! (Vercel format)', 
    timestamp: new Date().toISOString(),
    version: '1.0.2'
  });
});

// Catch-all handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app for Vercel
module.exports = app;
