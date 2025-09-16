import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validation';
import { UserRole } from '@/types';
import { MetalController } from '@/controllers/MetalController';
import { MetalSchemas } from '@/validators/metal';

const router = Router();
const metalController = new MetalController();

// Protected routes - require authentication
router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN), metalController.getAll);
router.post('/', validate(MetalSchemas.create), authorize(UserRole.ADMIN), metalController.create);
router.get('/:id', validate(MetalSchemas.getById), authorize(UserRole.ADMIN), metalController.getById);
router.put('/:id', validate(MetalSchemas.update), authorize(UserRole.ADMIN), metalController.update);
router.delete('/:id', validate(MetalSchemas.delete), authorize(UserRole.ADMIN), metalController.delete);

export default router; 