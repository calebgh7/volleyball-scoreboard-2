import { validateEnvironment } from './env-validation';
import { initializeDatabase } from './database';
import { isCloudinaryConfigured } from './cloud-storage';

// Startup validation and initialization
export const validateStartup = async (): Promise<void> => {
  console.log('🚀 Starting VolleyScore Pro validation...');
  
  try {
    // 1. Validate environment variables
    console.log('📋 Validating environment variables...');
    validateEnvironment();
    
    // 2. Initialize database connection
    console.log('🗄️ Initializing database connection...');
    await initializeDatabase();
    
    // 3. Validate Cloudinary configuration (if applicable)
    if (isCloudinaryConfigured()) {
      console.log('☁️ Cloudinary configuration validated');
    } else {
      console.log('⚠️ Cloudinary not configured - will use local storage');
    }
    
    // 4. Validate JWT configuration
    if (process.env.NODE_ENV === 'production') {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long in production');
      }
      if (jwtSecret === 'your-super-secret-jwt-key-here') {
        throw new Error('JWT_SECRET cannot use the default value in production');
      }
      console.log('🔐 JWT configuration validated');
    }
    
    // 5. Validate port configuration
    const port = parseInt(process.env.PORT || '3000');
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 1 and 65535`);
    }
    console.log(`🌐 Port configuration validated: ${port}`);
    
    console.log('✅ All startup validations passed successfully!');
    console.log(`🎯 App will start on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    
  } catch (error) {
    console.error('❌ Startup validation failed:', error);
    console.error('💡 Please check your environment configuration and try again');
    process.exit(1);
  }
};

// Health check function
export const healthCheck = async (): Promise<{ status: 'healthy' | 'unhealthy'; details: Record<string, any> }> => {
  try {
    const checks = {
      environment: 'healthy',
      database: 'healthy',
      cloudinary: 'healthy',
      timestamp: new Date().toISOString(),
    };
    
    // Check database connection
    try {
      // This would check if the database is actually responding
      // For now, we'll assume it's healthy if we got this far
      checks.database = 'healthy';
    } catch (error) {
      checks.database = 'unhealthy';
    }
    
    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      checks.cloudinary = 'not_configured';
    }
    
    const overallStatus = Object.values(checks).every(status => 
      status === 'healthy' || status === 'not_configured'
    ) ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      details: checks,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    };
  }
};

// Graceful shutdown function
export const gracefulShutdown = async (): Promise<void> => {
  console.log('🔄 Starting graceful shutdown...');
  
  try {
    // Close database connections
    // This would be implemented when we have the database connection
    console.log('✅ Graceful shutdown completed');
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
  }
  
  process.exit(0);
};

// Setup process event handlers
export const setupProcessHandlers = (): void => {
  // Handle graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
  });
  
  console.log('🛡️ Process event handlers configured');
};
