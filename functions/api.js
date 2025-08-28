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
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Serverless function working!', 
      timestamp: new Date().toISOString(),
      version: '2.0.2',
      method: req.method,
      url: req.url
    });
  }

  // Default response
  res.status(200).json({ 
    message: 'Function is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
