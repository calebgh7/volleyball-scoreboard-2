module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path from the request
  const path = req.url || req.path || '';

  // Test endpoint
  if (req.method === 'GET' && path.includes('/api/test')) {
    return res.status(200).json({ 
      message: 'Serverless function working!', 
      timestamp: new Date().toISOString(),
      version: '2.0.1',
      path: path
    });
  }

  // Health endpoint
  if (req.method === 'GET' && path.includes('/api/health')) {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Serverless function healthy!',
      version: '2.0.1',
      path: path
    });
  }

  // Cloudinary status endpoint
  if (req.method === 'GET' && path.includes('/api/cloudinary/status')) {
    return res.status(200).json({
      configured: false,
      message: 'Cloudinary integration pending - serverless function working',
      timestamp: new Date().toISOString(),
      path: path
    });
  }

  // Default response
  res.status(404).json({ 
    error: 'Route not found',
    path: path,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: 'Function is working but route not matched'
  });
};
