import { Router } from 'express';
import { ProductController } from '@/controllers/ProductController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validation';
import { productSchemas } from '@/validators/product';
import { UserRole } from '@/types';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', validate(productSchemas.getProducts), productController.getAll);
router.get('/search', productController.search);
router.get('/categories', productController.getCategories);
router.get('/in-stock', productController.getInStock);
router.get('/price-range', productController.getByPriceRange);
router.get('/low-stock', productController.getLowStock);
router.get('/category/:category', validate(productSchemas.getByCategory), productController.getByCategory);
router.get('/:id', validate(productSchemas.getById), productController.getById);

// Protected routes - require authentication
router.use(authenticate);

// Product management routes - require admin or moderator role
router.post('/', validate(productSchemas.create), authorize(UserRole.ADMIN, UserRole.MODERATOR), productController.create);
router.put('/:id', validate(productSchemas.update), authorize(UserRole.ADMIN, UserRole.MODERATOR), productController.update);
router.delete('/:id', validate(productSchemas.delete), authorize(UserRole.ADMIN), productController.delete);
router.put('/:id/stock', validate(productSchemas.updateStock), authorize(UserRole.ADMIN, UserRole.MODERATOR), productController.updateStock);
router.post('/bulk-update-stock', authorize(UserRole.ADMIN, UserRole.MODERATOR), productController.bulkUpdateStock);

// Admin only routes
router.get('/stats/overview', authorize(UserRole.ADMIN), productController.getStats);

export default router; 