import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email too long');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Hex color validation schema
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format (e.g., #FF0000)');

// Team name validation schema
export const teamNameSchema = z
  .string()
  .min(1, 'Team name is required')
  .max(50, 'Team name too long')
  .regex(/^[a-zA-Z0-9\s\-']+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and apostrophes');

// Match format validation schema
export const matchFormatSchema = z
  .number()
  .int()
  .min(3, 'Match format must be at least 3 sets')
  .max(5, 'Match format cannot exceed 5 sets');

// Score validation schema
export const scoreSchema = z
  .number()
  .int()
  .min(0, 'Score cannot be negative')
  .max(100, 'Score cannot exceed 100');

// Set number validation schema
export const setNumberSchema = z
  .number()
  .int()
  .min(1, 'Set number must be at least 1')
  .max(10, 'Set number cannot exceed 10');

// User registration schema
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
});

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Team creation/update schema
export const teamSchema = z.object({
  name: teamNameSchema,
  location: z.string().max(100, 'Location too long').optional(),
  colorScheme: z.enum(['pink', 'cyan', 'orange', 'purple', 'green', 'red', 'blue', 'yellow', 'custom']),
  customColor: hexColorSchema.optional(),
  customTextColor: hexColorSchema.optional(),
  customSetBackgroundColor: hexColorSchema.optional(),
});

// Match creation/update schema
export const matchSchema = z.object({
  name: z.string().max(100, 'Match name too long').optional(),
  homeTeamId: z.number().int().positive('Home team ID must be positive'),
  awayTeamId: z.number().int().positive('Away team ID must be positive'),
  format: matchFormatSchema,
});

// Score update schema
export const scoreUpdateSchema = z.object({
  team: z.enum(['home', 'away']),
  increment: z.boolean(),
});

// Set completion schema
export const setCompletionSchema = z.object({
  homeScore: scoreSchema,
  awayScore: scoreSchema,
  setNumber: setNumberSchema,
});

// Settings update schema
export const settingsSchema = z.object({
  primaryColor: hexColorSchema.optional(),
  accentColor: hexColorSchema.optional(),
  theme: z.enum(['standard', 'dark', 'light', 'custom']).optional(),
  defaultMatchFormat: matchFormatSchema.optional(),
  autoSave: z.boolean().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().regex(/^image\/(jpeg|jpg|png|gif|svg)$/, 'Only image files are allowed'),
  size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
};

export const validateInputSafe = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};
