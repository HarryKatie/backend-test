import { IUser, CreateUserData, UpdateUserData, PaginationOptions, PaginatedResult } from '@/types';
import { IUserService } from '@/interfaces';
import { UserRepository } from '@/repositories/UserRepository';
import { AuthService } from '@/services/AuthService';
import { NotFoundError, BadRequestError, ConflictError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { EmailService } from './EmailService';

export class UserService implements IUserService {
  private userRepository: UserRepository;
  private authService: AuthService;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
    this.emailService = new EmailService();
  }

  async create(data: CreateUserData): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      ...data,
      // password: hashedPassword,
      password: data.password,
    });

    logger.info(`User created: ${user.email}`);
    return user;
  }

  async register(userData: CreateUserData): Promise<IUser> {
    return this.create(userData);
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Find user with password
    const user = await this.userRepository.findByEmailAndPassword(email, password);
    if (!user) {
      throw new BadRequestError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new BadRequestError('User account is deactivated');
    }

    // Generate JWT token
    const token = this.authService.generateToken(user);

    logger.info(`User logged in: ${user.email}`);
    return { user, token };
  }

  async getById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getAll(options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.userRepository.findAll(options);
  }

  async update(id: string, data: UpdateUserData): Promise<IUser> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new ConflictError('User with this email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    logger.info(`User updated: ${updatedUser.email}`);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const deleted = await this.userRepository.delete(id);
    if (deleted) {
      logger.info(`User deleted: ${user.email}`);
    }

    return deleted;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    // Get user with password
    const user = await this.userRepository.findByEmailAndPassword(
      (await this.userRepository.findById(userId))?.email || '',
      oldPassword
    );

    if (!user) {
      throw new BadRequestError('Invalid old password');
    }

    // Hash new password
    const hashedNewPassword = await this.authService.hashPassword(newPassword);

    // Update password
    const updated = await this.userRepository.updatePassword(userId, hashedNewPassword);

    if (updated) {
      logger.info(`Password changed for user: ${user.email}`);
    }

    return updated;
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      logger.info(`Password reset requested for email: ${email}`);
      return true;
    }

    // Generate reset token
    const resetToken = await this.authService.generatePasswordResetToken(user._id);
    const fullName = user.firstName + ' ' + user.lastName;
    console.log('resetToken: ', resetToken);


    // ✅ Send email
    await this.emailService.sendPasswordResetEmail(email, resetToken, fullName);
    logger.info(`Password reset email sent to: ${email}`);
    return true;
  }

  async deactivateUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const deactivated = await this.userRepository.deactivateUser(id);
    if (deactivated) {
      logger.info(`User deactivated: ${user.email}`);
    }

    return deactivated;
  }

  async activateUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const activated = await this.userRepository.activateUser(id);
    if (activated) {
      logger.info(`User activated: ${user.email}`);
    }

    return activated;
  }

  // Additional business logic methods
  async searchUsers(searchTerm: string, options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.userRepository.searchUsers(searchTerm, options);
  }

  async getUsersByRole(role: string, options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.userRepository.findUsersByRole(role as any, options);
  }

  async getUserProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateUserData): Promise<IUser> {
    // Remove sensitive fields that shouldn't be updated via profile
    const { role, isActive, ...profileData } = data;

    return this.update(userId, profileData);
  }
} 