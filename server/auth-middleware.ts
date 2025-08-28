import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Simple, hardcoded JWT secret for reliability
const JWT_SECRET = 'volleyball-scoreboard-secret-key-2024';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        req.user = {
          id: decoded.userId,
          email: decoded.email
        };
      } catch (jwtError) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth: Invalid token, continuing as unauthenticated');
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
}
