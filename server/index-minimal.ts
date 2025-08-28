const express = require('express');
const cors = require('cors');
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

// Health check endpoint
app.get('/api/health', async (req: any, res: any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Minimal server running'
  });
});

// Cloudinary status endpoint
app.get('/api/cloudinary/status', async (req: any, res: any) => {
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

// Image upload endpoints
app.post('/api/upload/logo', async (req: any, res: any) => {
  try {
    const { imageData, filename, teamId } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ error: 'Cloud storage not configured' });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/logos/${teamId || 'default'}`,
      transformation: {
        width: 512,
        height: 512,
        crop: 'limit',
        quality: 80
      }
    });

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

app.post('/api/upload/sponsor', async (req: any, res: any) => {
  try {
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    if (!cloudStorage.isConfigured()) {
      return res.status(500).json({ error: 'Cloud storage not configured' });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudStorage.uploadImageFromBase64(imageData, filename, {
      folder: `volleyscore/sponsors/default`,
      transformation: {
        width: 800,
        height: 400,
        crop: 'limit',
        quality: 80
      }
    });

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

app.delete('/api/upload/:publicId', async (req: any, res: any) => {
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

// Test endpoint
app.get('/api/test', (req: any, res: any) => {
  res.json({ message: 'Minimal server is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📸 Cloudinary integration ready`);
});
