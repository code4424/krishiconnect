import { Router } from 'express';
import { OrderController } from './order.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { createOrderSchema, ROLES } from '@krishi/shared';

const router = Router();

router.post(
  '/', 
  authenticate, 
  requireRole([ROLES.FARMER]),
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

router.get(
  '/', 
  authenticate, 
  OrderController.getOrders
);

export { router as orderRoutes };
