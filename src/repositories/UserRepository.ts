import { IUser, PaginationOptions, PaginatedResult, UserRole } from '@/types';
import { IUserRepository } from '@/interfaces';
import { UserModel, IUserDocument } from '@/models/User';
import { NotFoundError, ConflictError } from '@/utils/errors';

export class UserRepository implements IUserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    try {
      const user = await UserModel.create(data);
      return user.toJSON() as any;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('User with this email already exists');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).select('-password');
    return user ? user.toJSON() : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('-password');
    return user ? user.toJSON() : null;
  }

  async findByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return null;

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return null;

    return user.toJSON();
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      UserModel.find()
        .select('-password')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).select('-password');

      return user ? user.toJSON() : null;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('User with this email already exists');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async exists(id: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    return !!user;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(id, {
      $set: { password: hashedPassword },
    });
    return !!result;
  }

  async deactivateUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(id, {
      $set: { isActive: false },
    });
    return !!result;
  }

  async activateUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(id, {
      $set: { isActive: true },
    });
    return !!result;
  }

  // Additional methods for advanced queries
  async findUsersByRole(role: UserRole, options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      UserModel.find({ role })
        .select('-password')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments({ role }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async searchUsers(searchTerm: string, options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const searchRegex = new RegExp(searchTerm, 'i');

    const [users, total] = await Promise.all([
      UserModel.find({
        $or: [
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      })
        .select('-password')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments({
        $or: [
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
} 