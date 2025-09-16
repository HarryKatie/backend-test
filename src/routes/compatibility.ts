import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validation';
import { UserRole } from '@/types';
import { compatibilitySchemas } from '@/validators/compatibility';
import { CompatibilityController } from '@/controllers/CompatibilityController';

const router = Router();
const compatibilityController = new CompatibilityController();

router.get('/web-app', compatibilityController.getAllCompatibilitForWebApp);
router.get('/ios-app', compatibilityController.getAllCompatibilitForIosApp);

// 🔐 Only apply auth middleware after public routes
router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN), compatibilityController.getAll);
router.post('/', validate(compatibilitySchemas.create), authorize(UserRole.ADMIN), compatibilityController.create);
router.put('/:id', validate(compatibilitySchemas.update), authorize(UserRole.ADMIN), compatibilityController.update);
router.get('/:id', validate(compatibilitySchemas.getById), authorize(UserRole.ADMIN), compatibilityController.getById);
router.delete('/:id', validate(compatibilitySchemas.delete), authorize(UserRole.ADMIN), compatibilityController.delete);
// router.get('/by-chemical/:chemicalName', validate(compatibilitySchemas.getByChemical), compatibilityController.getByChemical);


export default router; 