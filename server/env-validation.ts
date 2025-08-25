// Environment variable validation
export const validateEnvironment = (): void => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
  ];

  const productionVars = [
    'JWT_SECRET',
    'DATABASE_URL',
  ];

  const cloudinaryVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missingVars: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check production variables if in production
  if (process.env.NODE_ENV === 'production') {
    for (const varName of productionVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
  }

  // Check Cloudinary variables if using cloud storage
  const useCloudinary = process.env.USE_CLOUDINARY === 'true' || process.env.NODE_ENV === 'production';
  if (useCloudinary) {
    for (const varName of cloudinaryVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Environment validation failed:', errorMessage);
    throw new Error(errorMessage);
  }

  // Validate specific variable formats
  const port = parseInt(process.env.PORT || '3000');
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 1 and 65535`);
  }

  // Validate JWT secret strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-here') {
      throw new Error('JWT_SECRET cannot use the default value in production');
    }
  }

  // Validate Cloudinary configuration
  if (useCloudinary) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName && !/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
      throw new Error('CLOUDINARY_CLOUD_NAME contains invalid characters');
    }
  }

  console.log('✅ Environment validation passed');
};

// Get validated environment variables
export const getEnvVar = (key: string, required = true): string => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value || '';
};

// Environment configuration object
export const env = {
  NODE_ENV: getEnvVar('NODE_ENV', true),
  PORT: parseInt(getEnvVar('PORT', true)),
  JWT_SECRET: getEnvVar('JWT_SECRET', process.env.NODE_ENV === 'production'),
  DATABASE_URL: getEnvVar('DATABASE_URL', process.env.NODE_ENV === 'production'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', false),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', false),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', false),
  USE_CLOUDINARY: process.env.USE_CLOUDINARY === 'true' || process.env.NODE_ENV === 'production',
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', false) || 'http://localhost:3000',
  SESSION_SECRET: getEnvVar('SESSION_SECRET', false) || 'default-session-secret-change-in-production',
} as const;
