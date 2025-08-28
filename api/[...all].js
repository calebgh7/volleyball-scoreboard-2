// Vercel API route handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Health check endpoint
  if (req.method === 'GET' && pathname === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'API server running (Vercel API route)',
      version: '1.0.7'
    });
  }

  // Cloudinary status endpoint
  if (req.method === 'GET' && pathname === '/api/cloudinary/status') {
    return res.status(200).json({
      configured: false,
      message: 'Cloudinary integration pending - server deployed successfully',
      timestamp: new Date().toISOString()
    });
  }

  // Test endpoint
  if (req.method === 'GET' && pathname === '/api/test') {
    return res.status(200).json({ 
      message: 'API server is working! (Vercel API route)', 
      timestamp: new Date().toISOString(),
      version: '1.0.7'
    });
  }

  // Logo upload endpoint
  if (req.method === 'POST' && pathname === '/api/upload/logo') {
    const { imageData, filename, teamId } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    return res.status(200).json({
      message: 'Logo upload endpoint working (Cloudinary integration pending)',
      received: { filename, teamId, hasImageData: !!imageData },
      timestamp: new Date().toISOString()
    });
  }

  // Sponsor logo upload endpoint
  if (req.method === 'POST' && pathname === '/api/upload/sponsor') {
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    return res.status(200).json({
      message: 'Sponsor logo upload endpoint working (Cloudinary integration pending)',
      received: { filename, hasImageData: !!imageData },
      timestamp: new Date().toISOString()
    });
  }

  // Image deletion endpoint
  if (req.method === 'DELETE' && pathname.startsWith('/api/upload/')) {
    const publicId = pathname.split('/').pop();
    
    return res.status(200).json({ 
      message: 'Image deletion endpoint working (Cloudinary integration pending)',
      received: { publicId },
      timestamp: new Date().toISOString()
    });
  }

  // Default response for unmatched routes
  res.status(404).json({ 
    error: 'Route not found',
    path: pathname,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
