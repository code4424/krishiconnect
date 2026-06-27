import { Router } from 'express';
import { ProductController } from './product.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { createProductSchema, ROLES } from '@krishi/shared';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

router.post(
  '/', 
  authenticate, 
  requireRole([ROLES.PROVIDER, ROLES.ADMIN]),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

export { router as productRoutes };
