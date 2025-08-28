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
      message: 'Serverless function working!', 
      timestamp: new Date().toISOString(),
      version: '3.0.2',
      method: req.method,
      url: req.url
    });
  }

  // Health endpoint
  if (req.method === 'GET' && req.url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Serverless function healthy!',
      version: '3.0.2'
    });
  }

  // Cloudinary status endpoint (placeholder for now)
  if (req.method === 'GET' && req.url === '/api/cloudinary/status') {
    return res.status(200).json({
      configured: false,
      message: 'Cloudinary integration ready - environment variables need to be set',
      timestamp: new Date().toISOString(),
      note: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel'
    });
  }

  // Logo upload endpoint (placeholder for now)
  if (req.method === 'POST' && req.url === '/api/upload/logo') {
    const { imageData, filename, teamId } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    return res.status(200).json({
      message: 'Logo upload endpoint ready - Cloudinary integration pending',
      received: { filename, teamId, hasImageData: !!imageData },
      timestamp: new Date().toISOString(),
      note: 'Set Cloudinary environment variables to enable actual uploads'
    });
  }

  // Sponsor logo upload endpoint (placeholder for now)
  if (req.method === 'POST' && req.url === '/api/upload/sponsor') {
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    return res.status(200).json({
      message: 'Sponsor logo upload endpoint ready - Cloudinary integration pending',
      received: { filename, hasImageData: !!imageData },
      timestamp: new Date().toISOString(),
      note: 'Set Cloudinary environment variables to enable actual uploads'
    });
  }

  // Image deletion endpoint (placeholder for now)
  if (req.method === 'DELETE' && req.url.startsWith('/api/upload/')) {
    const publicId = req.url.split('/').pop();
    
    return res.status(200).json({ 
      message: 'Image deletion endpoint ready - Cloudinary integration pending',
      received: { publicId },
      timestamp: new Date().toISOString(),
      note: 'Set Cloudinary environment variables to enable actual deletions'
    });
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
