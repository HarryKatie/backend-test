import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/UserService';
import { ApiSuccessResponse, AuthenticatedRequest } from '@/types';


export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.register(req.body);

      const response: ApiSuccessResponse<typeof user> = {
        success: true,
        message: 'User registered successfully',
        data: user,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);

      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        message: 'Login successful',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserProfile(req.user!._id);

      const response: ApiSuccessResponse<typeof user> = {
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.updateProfile(req.user!._id, req.body);

      const response: ApiSuccessResponse<typeof user> = {
        success: true,
        message: 'Profile updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      await this.userService.changePassword(req.user!._id, oldPassword, newPassword);

      const response: ApiSuccessResponse<null> = {
        success: true,
        message: 'Password changed successfully',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPasswordRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.resetPassword(email);

      const response: ApiSuccessResponse<null> = {
        success: true,
        message: 'Password reset email sent successfully',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, sortOrder, search, role } = req.query;
      
      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      let result;
      if (search) {
        result = await this.userService.searchUsers(search as string, options);
      } else if (role) {
        result = await this.userService.getUsersByRole(role as string, options);
      } else {
        result = await this.userService.getAll(options);
      }

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        message: 'Users retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          statusCode: 400,
        });
        return;
      }
      const user = await this.userService.getById(id);

      const response: ApiSuccessResponse<typeof user> = {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          statusCode: 400,
        });
        return;
      }
      const user = await this.userService.update(id, req.body);

      const response: ApiSuccessResponse<typeof user> = {
        success: true,
        message: 'User updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          statusCode: 400,
        });
        return;
      }
      await this.userService.delete(id);

      const response: ApiSuccessResponse<null> = {
        success: true,
        message: 'User deleted successfully',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          statusCode: 400,
        });
        return;
      }
      await this.userService.deactivateUser(id);

      const response: ApiSuccessResponse<null> = {
        success: true,
        message: 'User deactivated successfully',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          statusCode: 400,
        });
        return;
      }
      await this.userService.activateUser(id);

      const response: ApiSuccessResponse<null> = {
        success: true,
        message: 'User activated successfully',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
} 