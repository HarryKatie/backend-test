import { z } from 'zod';
import { UserRole } from '@/types';

// User registration schema
export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email cannot exceed 255 characters'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
    role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
  }),
});

// User login schema
export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

// Update user schema
export const updateUserSchema = z.object({
  // params: z.object({
  //   id: z.string().min(1, 'User ID is required'),
  // }),
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .optional(),
    firstName: z
      .string()
      .min(1, 'First name cannot be empty')
      .max(50, 'First name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name cannot be empty')
      .max(50, 'Last name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
      .optional(),
    isActive: z.boolean().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Change password schema
export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .max(128, 'New password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
  }),
});

// Reset password request schema
export const resetPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
  }),
});

// Get user by ID schema
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

// Get users with pagination schema
export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    sortBy: z.enum(['email', 'firstName', 'lastName', 'createdAt', 'role']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
  }),
});

// Delete user schema
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

// Export all schemas
export const userSchemas = {
  register: registerUserSchema,
  login: loginUserSchema,
  update: updateUserSchema,
  changePassword: changePasswordSchema,
  resetPasswordRequest: resetPasswordRequestSchema,
  getById: getUserByIdSchema,
  getUsers: getUsersSchema,
  delete: deleteUserSchema,
}; 