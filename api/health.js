export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Health endpoint working!',
    version: '1.0.5'
  });
}
