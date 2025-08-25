import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../shared/schema';
import { env } from './env-validation';

// Database connection configuration
const getDatabaseConfig = () => {
  const isProduction = env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: Use PostgreSQL
    return {
      url: env.DATABASE_URL,
      max: 10, // Connection pool size
      ssl: { rejectUnauthorized: false },
    };
  } else {
    // Development: Use local PostgreSQL or fallback to in-memory
    const localDbUrl = process.env.LOCAL_DATABASE_URL || 'postgresql://localhost:5432/volleyscore';
    
    return {
      url: localDbUrl,
      max: 5,
      ssl: false,
    };
  }
};

// Create database connection
let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

// Initialize database with retry logic
export const initializeDatabase = async (retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      const config = getDatabaseConfig();
      client = postgres(config.url, config);
      db = drizzle(client, { schema });
      
      console.log(`✅ Database connected successfully (${process.env.NODE_ENV || 'development'} mode)`);
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        if (process.env.NODE_ENV === 'production') {
          throw error; // Fail fast in production
        } else {
          console.log('🔄 Falling back to in-memory storage for development');
          // We'll handle in-memory fallback in storage.ts
        }
      } else {
        // Wait before retrying (exponential backoff)
        const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

// Initialize database on module load
try {
  await initializeDatabase();
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

// Migration function
export const runMigrations = async () => {
  try {
    if (db) {
      await migrate(db, { migrationsFolder: './drizzle' });
      console.log('✅ Database migrations completed');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  if (client) {
    await client.end();
    console.log('✅ Database connection closed');
  }
};

export { db, client };
export default db;
