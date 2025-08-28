import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vercel serverless function handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Test endpoint
  if (req.method === 'GET' && req.url === '/api/test') {
    return res.status(200).json({ 
      message: 'Serverless function working with Cloudinary!', 
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      method: req.method,
      url: req.url
    });
  }

  // Health endpoint
  if (req.method === 'GET' && req.url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Serverless function healthy with Cloudinary!',
      version: '3.0.0'
    });
  }

  // Cloudinary status endpoint
  if (req.method === 'GET' && req.url === '/api/cloudinary/status') {
    try {
      const isConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
      
      if (isConfigured) {
        return res.status(200).json({
          configured: true,
          message: 'Cloudinary is properly configured and ready',
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(200).json({
          configured: false,
          message: 'Cloudinary not configured - missing environment variables',
          missing: {
            cloudName: !process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: !process.env.CLOUDINARY_API_KEY,
            apiSecret: !process.env.CLOUDINARY_API_SECRET
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      return res.status(500).json({
        configured: false,
        error: 'Failed to check Cloudinary status',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Logo upload endpoint
  if (req.method === 'POST' && req.url === '/api/upload/logo') {
    try {
      const { imageData, filename, teamId } = req.body;
      
      if (!imageData || !filename) {
        return res.status(400).json({ error: 'Image data and filename are required' });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: 'Cloudinary not configured' });
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(imageData, {
        folder: `volleyscore/logos/${teamId || 'default'}`,
        transformation: {
          width: 512,
          height: 512,
          crop: 'limit',
          quality: 80
        },
        resource_type: 'image'
      });

      return res.status(200).json({
        message: 'Logo uploaded successfully to Cloudinary!',
        logo: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          thumbnailUrl: cloudinary.url(uploadResult.public_id, {
            transformation: {
              width: 150,
              height: 150,
              crop: 'fill',
              quality: 80
            }
          })
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Logo upload failed:', error);
      return res.status(500).json({ 
        error: 'Logo upload failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sponsor logo upload endpoint
  if (req.method === 'POST' && req.url === '/api/upload/sponsor') {
    try {
      const { imageData, filename } = req.body;
      
      if (!imageData || !filename) {
        return res.status(400).json({ error: 'Image data and filename are required' });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: 'Cloudinary not configured' });
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(imageData, {
        folder: 'volleyscore/sponsors',
        transformation: {
          width: 800,
          height: 400,
          crop: 'limit',
          quality: 80
        },
        resource_type: 'image'
      });

      return res.status(200).json({
        message: 'Sponsor logo uploaded successfully to Cloudinary!',
        logo: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          thumbnailUrl: cloudinary.url(uploadResult.public_id, {
            transformation: {
              width: 300,
              height: 150,
              crop: 'fill',
              quality: 80
            }
          })
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sponsor logo upload failed:', error);
      return res.status(500).json({ 
        error: 'Sponsor logo upload failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Image deletion endpoint
  if (req.method === 'DELETE' && req.url.startsWith('/api/upload/')) {
    try {
      const publicId = req.url.split('/').pop();
      
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: 'Cloudinary not configured' });
      }

      // Delete from Cloudinary
      const deleteResult = await cloudinary.uploader.destroy(publicId);
      
      if (deleteResult.result === 'ok') {
        return res.status(200).json({ 
          message: 'Image deleted successfully from Cloudinary',
          publicId: publicId,
          result: deleteResult.result,
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to delete image from Cloudinary',
          result: deleteResult.result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Image deletion failed:', error);
      return res.status(500).json({ 
        error: 'Image deletion failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Default response for unmatched routes
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: 'Function is working but route not matched'
  });
}
