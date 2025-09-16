import { IUser, CreateUserData, UpdateUserData, PaginationOptions, PaginatedResult } from '@/types';

// Base Repository Interface
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// User Repository Interface
export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailAndPassword(email: string, password: string): Promise<IUser | null>;
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;
  deactivateUser(id: string): Promise<boolean>;
  activateUser(id: string): Promise<boolean>;
}

// Base Service Interface
export interface IBaseService<T, CreateData, UpdateData> {
  create(data: CreateData): Promise<T>;
  getById(id: string): Promise<T>;
  getAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// User Service Interface
export interface IUserService extends IBaseService<IUser, CreateUserData, UpdateUserData> {
  register(userData: CreateUserData): Promise<IUser>;
  login(email: string, password: string): Promise<{ user: IUser; token: string }>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
  resetPassword(email: string): Promise<boolean>;
  deactivateUser(id: string): Promise<boolean>;
  activateUser(id: string): Promise<boolean>;
}

// Authentication Service Interface
export interface IAuthService {
  generateToken(user: IUser): string;
  generatePasswordResetToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<IUser | null>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}

// Validation Service Interface
export interface IValidationService {
  validateUser(data: CreateUserData): Promise<{ isValid: boolean; errors?: Record<string, string[]> }>;
  validateUpdateUser(data: UpdateUserData): Promise<{ isValid: boolean; errors?: Record<string, string[]> }>;
  validateLogin(email: string, password: string): Promise<{ isValid: boolean; errors?: Record<string, string[]> }>;
}

// Logger Interface
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Database Connection Interface
export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Cache Interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Email Service Interface
export interface IEmailService {
  // sendEmail(to: string, subject: string, content: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<string>;
  sendWelcomeEmail(email: string, firstName: string): Promise<boolean>;
}

// File Upload Service Interface
export interface IFileUploadService {
  uploadFile(file: any): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getFileUrl(fileName: string): string;
} 