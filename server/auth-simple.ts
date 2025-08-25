import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory user storage (in production, this would be a database)
const users = new Map();
const sessions = new Map();

// Initialize with a default user for testing
(function initializeUsers() {
  const defaultUser = {
    id: 'default-user-id',
    email: 'admin@volleyscore.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
    name: 'Admin User',
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  users.set(defaultUser.email, defaultUser);
})();

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

// Register new user
export const registerUser = async (data: RegisterData): Promise<AuthUser> => {
  try {
    // Check if user already exists
    if (users.has(data.email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    users.set(data.email, newUser);
    
    console.log(`✅ User registered successfully: ${newUser.email}`);
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
    // Find user
    const user = users.get(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    users.set(credentials.email, user);

    // Generate token
    const token = generateToken(user.id);

    // Store session
    sessions.set(token, {
      userId: user.id,
      email: user.email,
      createdAt: new Date()
    });

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

    const session = sessions.get(token);
    if (!session) {
      return null;
    }

    // Find user
    for (const user of users.values()) {
      if (user.id === decoded.userId) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
};

// Logout user
export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    sessions.delete(token);
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};

// Get user by ID
export const getUserById = (userId: string): AuthUser | null => {
  for (const user of users.values()) {
    if (user.id === userId) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }
  }
  return null;
};

// Get all users (for admin purposes)
export const getAllUsers = (): AuthUser[] => {
  return Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
  }));
};
