import { Router } from 'express';
import userRoutes from './user';
import productRoutes from './product';
import compatibilityRoutes from './compatibility';
import metalRoutes from './metal';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use('/api/users', userRoutes);
router.use('/api/products', productRoutes);
router.use('/api/compatibilities', compatibilityRoutes);
router.use('/api/metals', metalRoutes);

// 404 handler for unmatched routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

export default router; 