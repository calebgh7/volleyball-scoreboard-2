import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { databaseStorage } from './database-storage.js';

// Simple, hardcoded JWT secret for reliability
const JWT_SECRET = 'volleyball-scoreboard-secret-key-2024';
const JWT_EXPIRES_IN = '7d'; // 7 days for better user experience

// In-memory fallback storage
const fallbackUsers = new Map();
const fallbackSessions = new Map();

// Initialize with a default admin user
if (fallbackUsers.size === 0) {
  const adminId = randomUUID();
  const hashedPassword = bcryptjs.hashSync('admin123', 10);
  
  fallbackUsers.set(adminId, {
    id: adminId,
    email: 'admin@volleyball.com',
    password: hashedPassword,
    name: 'Admin User',
    createdAt: new Date().toISOString()
  });
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export async function registerUser(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await databaseStorage.findUserByEmail(email) || fallbackUsers.get(email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    const userId = randomUUID();
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    const newUser: User = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    // Try database first, fallback to memory
    try {
      await databaseStorage.createUser(newUser);
      await databaseStorage.initializeUserData(userId);
    } catch (dbError) {
      console.log('Database storage failed, using fallback:', dbError);
      fallbackUsers.set(userId, newUser);
    }

    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Store session
    const session: Session = {
      id: randomUUID(),
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await databaseStorage.createSession(session);
    } catch (dbError) {
      console.log('Database session storage failed, using fallback:', dbError);
      fallbackSessions.set(session.id, session);
    }

    return { success: true, user: newUser, token };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Find user in database or fallback
    let user = await databaseStorage.findUserByEmail(email);
    if (!user) {
      // Check fallback storage
      for (const [_, fallbackUser] of fallbackUsers) {
        if (fallbackUser.email === email) {
          user = fallbackUser;
          break;
        }
      }
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify password
    const isValidPassword = bcryptjs.compareSync(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    // Generate new token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Store session
    const session: Session = {
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await databaseStorage.createSession(session);
    } catch (dbError) {
      console.log('Database session storage failed, using fallback:', dbError);
      fallbackSessions.set(session.id, session);
    }

    return { success: true, user, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function authenticateUser(token: string): Promise<AuthResult> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Find user
    let user = await databaseStorage.findUserById(decoded.userId);
    if (!user) {
      // Check fallback storage
      user = fallbackUsers.get(decoded.userId);
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if session exists and is valid
    let session = await databaseStorage.findSession(token);
    if (!session) {
      // Check fallback storage
      for (const [_, fallbackSession] of fallbackSessions) {
        if (fallbackSession.token === token) {
          session = fallbackSession;
          break;
        }
      }
    }

    if (!session || new Date(session.expiresAt) < new Date()) {
      return { success: false, error: 'Session expired' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Invalid token' };
  }
}

export async function logoutUser(token: string): Promise<AuthResult> {
  try {
    // Delete session from database
    try {
      await databaseStorage.deleteSession(token);
    } catch (dbError) {
      console.log('Database session deletion failed, using fallback:', dbError);
      // Delete from fallback storage
      for (const [sessionId, fallbackSession] of fallbackSessions) {
        if (fallbackSession.token === token) {
          fallbackSessions.delete(sessionId);
          break;
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

// Cleanup expired sessions
export function cleanupExpiredSessions() {
  const now = new Date();
  
  // Cleanup fallback sessions
  for (const [sessionId, session] of fallbackSessions) {
    if (new Date(session.expiresAt) < now) {
      fallbackSessions.delete(sessionId);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
