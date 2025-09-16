import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validation';
import { userSchemas } from '@/validators/user';
import { UserRole } from '@/types';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(userSchemas.register), userController.register);
router.post('/login', validate(userSchemas.login), userController.login);
router.post('/reset-password', validate(userSchemas.resetPasswordRequest), userController.resetPasswordRequest);

// 🔐 Only apply auth middleware after public routes
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(userSchemas.update), userController.updateProfile);
router.put('/change-password', validate(userSchemas.changePassword), userController.changePassword);

// Admin routes - require admin role
router.get('/', validate(userSchemas.getUsers), authorize(UserRole.ADMIN), userController.getAllUsers);
router.get('/:id', validate(userSchemas.getById), authorize(UserRole.ADMIN), userController.getUserById);
router.put('/:id', validate(userSchemas.update), authorize(UserRole.ADMIN), userController.updateUser);
router.delete('/:id', validate(userSchemas.delete), authorize(UserRole.ADMIN), userController.deleteUser);
router.put('/:id/deactivate', validate(userSchemas.getById), authorize(UserRole.ADMIN), userController.deactivateUser);
router.put('/:id/activate', validate(userSchemas.getById), authorize(UserRole.ADMIN), userController.activateUser);

export default router; 