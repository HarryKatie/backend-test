import { Request } from 'express';

// User types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type CompatibilityRow = {
  chemicalName: string;
  [metal: string]: boolean | null | string; // allow string ONLY for chemicalName
};

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// Product types
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IMetal {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
}

export interface CreateMetalData {
  name: string;
}

export interface UpdateMetalData {
  name?: string;
}


// Request types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Database types
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Document interface
export interface MongooseDocument {
  _id: string;
  __v: number;
}

// Service types
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: UserRole;
}

// JWT types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string[]>;
}

// API Response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginatedResult<T>['pagination'];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse; 