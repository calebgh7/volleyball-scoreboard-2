import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { teams, matches, gameState, settings, users, userSessions, scoreboardTemplates } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔗 Database URL found:', DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

// Create postgres client with better configuration for Supabase
const client = postgres(DATABASE_URL, {
  max: 1, // Use only one connection for serverless
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connect_timeout: 10, // 10 second timeout
  idle_timeout: 20, // 20 second idle timeout
  max_lifetime: 60, // 60 second max lifetime
  onnotice: (notice) => console.log('Database notice:', notice),
  onparameter: (param) => console.log('Database parameter:', param),
});

// Test the connection immediately
client`SELECT 1 as test`.then(() => {
  console.log('✅ Database connection test successful');
}).catch((error) => {
  console.error('❌ Database connection test failed:', error);
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
    console.log('🔍 Testing database connection...');
    const result = await client`SELECT 1 as health_check, NOW() as timestamp`;
    console.log('✅ Database health check passed:', result[0]);
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
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
    console.log('🔄 Initializing database connection...');
    
    // Test the connection first
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ Database connection established successfully');
      
      // Try to query the users table to see if it exists
      try {
        const userCount = await db.select({ count: sql`count(*)` }).from(users);
        console.log('✅ Users table exists, count:', userCount[0]?.count || 0);
      } catch (tableError) {
        console.log('⚠️ Users table may not exist yet:', tableError.message);
      }
      
      return true;
    } else {
      console.log('⚠️ Database health check failed:', healthCheck.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
