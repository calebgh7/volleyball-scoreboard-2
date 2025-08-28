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

  // Test endpoint
  if (req.method === 'GET' && req.url === '/api/test') {
    return res.status(200).json({ 
      message: 'Serverless function working!', 
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  }

  // Health endpoint
  if (req.method === 'GET' && req.url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Serverless function healthy!',
      version: '2.0.0'
    });
  }

  // Cloudinary status endpoint
  if (req.method === 'GET' && req.url === '/api/cloudinary/status') {
    return res.status(200).json({
      configured: false,
      message: 'Cloudinary integration pending - serverless function working',
      timestamp: new Date().toISOString()
    });
  }

  // Default response
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
