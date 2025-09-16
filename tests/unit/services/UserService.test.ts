import { UserService } from '../../../src/services/UserService';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { AuthService } from '../../../src/services/AuthService';
import { CreateUserData, UserRole } from '../../../src/types';
import { ConflictError, NotFoundError, BadRequestError } from '../../../src/utils/errors';

// Mock dependencies
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/services/AuthService');
jest.mock('../../../src/utils/logger');

const MockedUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
const MockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepository = new MockedUserRepository() as jest.Mocked<UserRepository>;
    mockAuthService = new MockedAuthService() as jest.Mocked<AuthService>;
    
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
    (userService as any).authService = mockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserData: CreateUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.create(createUserData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserData.email);
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith(createUserData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserData,
        password: 'hashedPassword',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictError if user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.create(createUserData)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserData.email);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockUserWithPassword = { ...mockUser, password: 'hashedPassword' };
      
      mockUserRepository.findByEmailAndPassword.mockResolvedValue(mockUserWithPassword);
      mockAuthService.generateToken.mockReturnValue('jwt-token');

      const result = await userService.login(loginData.email, loginData.password);

      expect(mockUserRepository.findByEmailAndPassword).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(mockUserWithPassword);
      expect(result).toEqual({
        user: mockUserWithPassword,
        token: 'jwt-token',
      });
    });

    it('should throw BadRequestError for invalid credentials', async () => {
      mockUserRepository.findByEmailAndPassword.mockResolvedValue(null);

      await expect(userService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        BadRequestError
      );
    });

    it('should throw BadRequestError for deactivated user', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmailAndPassword.mockResolvedValue(deactivatedUser);

      await expect(userService.login('test@example.com', 'password123')).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getById('user123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    const updateData = { firstName: 'Jane' };

    it('should update user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await userService.update('user123', updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user123', updateData);
      expect(result).toEqual({ ...mockUser, ...updateData });
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.update('nonexistent', updateData)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if email is already taken', async () => {
      const existingUser = { ...mockUser, _id: 'user456' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        userService.update('user123', { email: 'existing@example.com' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.delete('user123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user123');
      expect(result).toBe(true);
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.delete('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
}); 