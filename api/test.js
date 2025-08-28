module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Test API endpoint working!', 
    timestamp: new Date().toISOString(),
    version: '1.0.9'
  });
};
