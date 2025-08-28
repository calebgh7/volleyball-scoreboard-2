// Vercel serverless function handler
export default async function handler(req, res) {
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
      version: '3.0.4',
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
      version: '3.0.4'
    });
  }

  // Current match endpoint (placeholder for now)
  if (req.method === 'GET' && req.url === '/api/current-match') {
    return res.status(200).json({
      match: {
        id: 'demo-match-1',
        currentSet: 1,
        format: 3,
        homeSetsWon: 0,
        awaySetsWon: 0,
        setHistory: []
      },
      homeTeam: {
        id: 'home-team-1',
        name: 'Home Team',
        logoPath: null,
        colorScheme: 'pink',
        customColor: null,
        customTextColor: null,
        customSetBackgroundColor: null
      },
      awayTeam: {
        id: 'away-team-1',
        name: 'Away Team',
        logoPath: null,
        colorScheme: 'cyan',
        customColor: null,
        customTextColor: null,
        customSetBackgroundColor: null
      },
      gameState: {
        homeScore: 0,
        awayScore: 0,
        displayOptions: {
          showSetHistory: true,
          showSponsors: true,
          showTimer: true
        },
        theme: 'default'
      }
    });
  }

  // Settings endpoint (placeholder for now)
  if (req.method === 'GET' && req.url === '/api/settings') {
    return res.status(200).json({
      primaryColor: '#3b82f6',
      accentColor: '#f59e0b',
      sponsorLogoPath: null,
      sponsorLogoPublicId: null
    });
  }

  // Team update endpoint
  if (req.method === 'PATCH' && req.url.startsWith('/api/teams/')) {
    try {
      const teamId = req.url.split('/').pop();
      const updates = req.body;
      
      console.log(`Updating team ${teamId} with:`, updates);
      
      // For now, just return success since we don't have a database
      // In a real implementation, you would update the team in your database
      return res.status(200).json({
        message: 'Team updated successfully',
        teamId: teamId,
        updates: updates,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Team update failed:', error);
      return res.status(500).json({ 
        error: 'Team update failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Match update endpoint
  if (req.method === 'PATCH' && req.url.startsWith('/api/matches/')) {
    try {
      const matchId = req.url.split('/').pop();
      const updates = req.body;
      
      console.log(`Updating match ${matchId} with:`, updates);
      
      // For now, just return success since we don't have a database
      return res.status(200).json({
        message: 'Match updated successfully',
        matchId: matchId,
        updates: updates,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Match update failed:', error);
      return res.status(500).json({ 
        error: 'Match update failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Game state update endpoint
  if (req.method === 'PATCH' && req.url.startsWith('/api/game-state/')) {
    try {
      const gameStateId = req.url.split('/').pop();
      const updates = req.body;
      
      console.log(`Updating game state ${gameStateId} with:`, updates);
      
      // For now, just return success since we don't have a database
      return res.status(200).json({
        message: 'Game state updated successfully',
        gameStateId: gameStateId,
        updates: updates,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Game state update failed:', error);
      return res.status(500).json({ 
        error: 'Game state update failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Score update endpoint
  if (req.method === 'PATCH' && req.url === '/api/scores') {
    try {
      const { matchId, homeScore, awayScore } = req.body;
      
      console.log(`Updating scores for match ${matchId}:`, { homeScore, awayScore });
      
      // For now, just return success since we don't have a database
      return res.status(200).json({
        message: 'Scores updated successfully',
        matchId: matchId,
        homeScore: homeScore,
        awayScore: awayScore,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Score update failed:', error);
      return res.status(500).json({ 
        error: 'Score update failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Set completion endpoint
  if (req.method === 'POST' && req.url === '/api/sets/complete') {
    try {
      const { matchId, homeScore, awayScore, setNumber, setHistory } = req.body;
      
      console.log(`Completing set ${setNumber} for match ${matchId}:`, { homeScore, awayScore, setHistory });
      
      // For now, just return success since we don't have a database
      return res.status(200).json({
        message: 'Set completed successfully',
        matchId: matchId,
        setNumber: setNumber,
        homeScore: homeScore,
        awayScore: awayScore,
        setHistory: setHistory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Set completion failed:', error);
      return res.status(500).json({ 
        error: 'Set completion failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Reset scores endpoint
  if (req.method === 'POST' && req.url === '/api/scores/reset') {
    try {
      const { matchId } = req.body;
      
      console.log(`Resetting scores for match ${matchId}`);
      
      // For now, just return success since we don't have a database
      return res.status(200).json({
        message: 'Scores reset successfully',
        matchId: matchId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Score reset failed:', error);
      return res.status(500).json({ 
        error: 'Score reset failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
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
      return res.status(200).json({
        configured: false,
        message: 'Cloudinary status check failed',
        error: error.message,
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
        return res.status(200).json({
          message: 'Logo upload endpoint ready - Cloudinary not configured',
          received: { filename, teamId, hasImageData: !!imageData },
          timestamp: new Date().toISOString(),
          note: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel'
        });
      }

      // Try to use Cloudinary if available
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

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
      } catch (cloudinaryError) {
        return res.status(200).json({
          message: 'Logo upload endpoint ready - Cloudinary error occurred',
          received: { filename, teamId, hasImageData: !!imageData },
          error: cloudinaryError.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
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
        return res.status(200).json({
          message: 'Sponsor logo upload endpoint ready - Cloudinary not configured',
          received: { filename, hasImageData: !!imageData },
          timestamp: new Date().toISOString(),
          note: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel'
        });
      }

      // Try to use Cloudinary if available
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

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
      } catch (cloudinaryError) {
        return res.status(200).json({
          message: 'Sponsor logo upload endpoint ready - Cloudinary error occurred',
          received: { filename, hasImageData: !!imageData },
          error: cloudinaryError.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
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
      // Extract the public ID from the URL path
      const pathParts = req.url.split('/');
      const publicId = pathParts.slice(3).join('/'); // Skip /api/upload/
      
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(200).json({ 
          message: 'Image deletion endpoint ready - Cloudinary not configured',
          received: { publicId },
          timestamp: new Date().toISOString(),
          note: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel'
        });
      }

      // Try to use Cloudinary if available
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

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
      } catch (cloudinaryError) {
        return res.status(200).json({ 
          message: 'Image deletion endpoint ready - Cloudinary error occurred',
          received: { publicId },
          error: cloudinaryError.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
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
