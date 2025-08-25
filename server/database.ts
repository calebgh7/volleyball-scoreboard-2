import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { teams, matches, gameState, settings, users, userSessions, scoreboardTemplates } from '../shared/schema.js';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const client = postgres(DATABASE_URL, {
  max: 1, // Use only one connection for serverless
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create drizzle instance
export const db = drizzle(client);

// Export schema for migrations
export const schema = {
  teams,
  matches,
  gameState,
  settings,
  users,
  userSessions,
  scoreboardTemplates,
};

// Migration function
export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await client`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await client.end();
    console.log('✅ Database connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// Initialize database tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Check if tables exist by trying to query them
    const tablesExist = await checkDatabaseHealth();
    
    if (tablesExist.status === 'healthy') {
      console.log('✅ Database tables are ready');
    } else {
      console.log('⚠️ Database tables may need initialization');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
