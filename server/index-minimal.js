const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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
    message: 'Minimal server running (JS version)'
  });
});

// Cloudinary status endpoint
app.get('/api/cloudinary/status', async (req, res) => {
  try {
    // For now, return a simple status since we can't import the cloud storage module
    res.json({
      configured: false,
      message: 'Cloudinary integration pending - server deployed successfully'
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
      received: { filename, teamId, hasImageData: !!imageData }
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
      received: { filename, hasImageData: !!imageData }
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
      received: { publicId }
    });
  } catch (error) {
    console.error('Image deletion failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Image deletion failed' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Minimal server is working! (JS version)', 
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT} (JS version)`);
  console.log(`📸 Cloudinary integration endpoints ready for testing`);
});
