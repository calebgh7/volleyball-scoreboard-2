import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from './auth-simple.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Full auth header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ No authorization header provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!token) {
      console.log('❌ No token found in authorization header');
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token starts with:', token.substring(0, 20));
    console.log('🔍 Token ends with:', token.substring(token.length - 20));
    
    const user = await authenticateUser(token);
    
    if (!user) {
      console.log('❌ Token authentication failed');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    console.log('✅ Token authenticated successfully for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Optional authentication middleware (user is optional)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await authenticateUser(token);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
