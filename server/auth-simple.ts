import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseStorage } from './database-storage.js';

// Initialize default user if needed
async function initializeDefaultUser() {
  try {
    const existingUser = await databaseStorage.findUserByEmail('admin@volleyscore.com');
    if (!existingUser) {
      const hashedPassword = await hashPassword('password123');
      await databaseStorage.createUser({
        id: 'default-user-id',
        email: 'admin@volleyscore.com',
        password: hashedPassword,
        name: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Initialize default data for this user
      await databaseStorage.initializeUserData('default-user-id');
      console.log('✅ Default user initialized');
    }
  } catch (error) {
    console.error('Failed to initialize default user:', error);
  }
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

// Fallback in-memory storage for when database is unavailable
const fallbackUsers = new Map();
const fallbackSessions = new Map();

// Register new user
export const registerUser = async (data: RegisterData): Promise<AuthUser> => {
  try {
    // Try database first
    if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
      try {
        // Check if user already exists
        const existingUser = await databaseStorage.findUserByEmail(data.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const newUser = await databaseStorage.createUser({
          id: `user-${Date.now()}`,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Initialize default data for the new user
        await databaseStorage.initializeUserData(newUser.id);
        
        console.log(`✅ User registered successfully in database: ${newUser.email}`);
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        };
      } catch (dbError) {
        console.warn('Database registration failed, falling back to in-memory storage:', dbError);
        // Fall through to in-memory storage
      }
    }

    // Fallback to in-memory storage
    if (fallbackUsers.has(data.email)) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fallbackUsers.set(data.email, newUser);
    
    console.log(`✅ User registered successfully in memory: ${newUser.email}`);
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
  } catch (error) {
    console.error('❌ User registration failed:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> => {
  try {
    let user = null;

    // Try database first
    if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
      try {
        user = await databaseStorage.findUserByEmail(credentials.email);
      } catch (dbError) {
        console.warn('Database login failed, trying in-memory storage:', dbError);
      }
    }

    // Fallback to in-memory storage
    if (!user) {
      user = fallbackUsers.get(credentials.email);
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    // Try to store session in database, fallback to memory
    try {
      if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
        await databaseStorage.updateUser(user.id, { lastLogin: new Date() });
        await databaseStorage.createSession({
          token,
          userId: user.id,
          email: user.email,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      } else {
        // In-memory session
        fallbackSessions.set(token, {
          userId: user.id,
          email: user.email,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    } catch (sessionError) {
      console.warn('Session storage failed, using in-memory:', sessionError);
      // Fallback to in-memory session
      fallbackSessions.set(token, {
        userId: user.id,
        email: user.email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    console.log(`✅ User logged in successfully: ${user.email}`);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    };
  } catch (error) {
    console.error('❌ User login failed:', error);
    throw error;
  }
};

// Authenticate user from token
export const authenticateUser = async (token: string): Promise<AuthUser | null> => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    let session = null;
    let user = null;

    // Try database first
    if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
      try {
        session = await databaseStorage.findSession(token);
        if (session) {
          user = await databaseStorage.findUserById(decoded.userId);
        }
      } catch (dbError) {
        console.warn('Database authentication failed, trying in-memory storage:', dbError);
      }
    }

    // Fallback to in-memory storage
    if (!session) {
      session = fallbackSessions.get(token);
      if (session) {
        user = fallbackUsers.get(session.email);
      }
    }

    if (!session || !user) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      try {
        if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
          await databaseStorage.deleteSession(token);
        } else {
          fallbackSessions.delete(token);
        }
      } catch (deleteError) {
        console.warn('Failed to delete expired session:', deleteError);
      }
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
};

// Logout user
export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    let deleted = false;

    // Try database first
    if (process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL) {
      try {
        deleted = await databaseStorage.deleteSession(token);
      } catch (dbError) {
        console.warn('Database logout failed, trying in-memory storage:', dbError);
      }
    }

    // Fallback to in-memory storage
    if (!deleted) {
      deleted = fallbackSessions.delete(token);
    }

    return deleted;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  try {
    const user = await databaseStorage.findUserById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    return null;
  }
};

// Get all users (for admin purposes)
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    // This would need to be implemented in database storage
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Failed to get all users:', error);
    return [];
  }
};

// Initialize default user when module is loaded
initializeDefaultUser().catch(console.error);
