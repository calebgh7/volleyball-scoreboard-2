import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { users, userSessions } from '../shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import { userRegistrationSchema, userLoginSchema, validateInput } from './validation';
import { env } from './env-validation';

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

// JWT configuration
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // 7 days
const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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
    // Validate input data
    const validatedData = validateInput(userRegistrationSchema, data);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with hashed password
    const newUser = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password: hashedPassword, // Store the hashed password
        name: validatedData.name,
      })
      .returning();

    const user = newUser[0];
    
    console.log(`✅ User registered successfully: ${user.email}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  } catch (error) {
    console.error('❌ User registration failed:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> => {
  try {
    // Validate input data
    const validatedCredentials = validateInput(userLoginSchema, credentials);
    
    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedCredentials.email))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult[0];

    // Verify password
    const isValidPassword = await verifyPassword(validatedCredentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    // Create or update session
    const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);
    
    await db
      .insert(userSessions)
      .values({
        userId: user.id,
        token,
        expiresAt,
      })
      .onConflictDoNothing();

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    console.log(`✅ User logged in successfully: ${user.email}`);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
      },
      token,
    };
  } catch (error) {
    console.error('❌ User login failed:', error);
    throw error;
  }
};

// Authenticate user from token
export const authenticateUser = async (token: string): Promise<AuthUser | null> => {
  try {
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Check if session exists and is valid
    const session = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.token, token),
          eq(userSessions.userId, decoded.userId),
          lt(userSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    // Get user data
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    const user = userResult[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  } catch (error) {
    console.error('❌ User authentication failed:', error);
    return null;
  }
};

// Logout user
export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    await db
      .delete(userSessions)
      .where(eq(userSessions.token, token));

    console.log('✅ User logged out successfully');
    return true;
  } catch (error) {
    console.error('❌ User logout failed:', error);
    return false;
  }
};

// Clean up expired sessions
export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const result = await db
      .delete(userSessions)
      .where(lt(userSessions.expiresAt, new Date()));

    console.log(`✅ Cleaned up ${result.rowCount} expired sessions`);
    return result.rowCount || 0;
  } catch (error) {
    console.error('❌ Session cleanup failed:', error);
    return 0;
  }
};
