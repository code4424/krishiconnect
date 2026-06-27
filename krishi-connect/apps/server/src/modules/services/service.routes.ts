import { Router } from 'express';
import { ServiceController } from './service.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createServiceSchema, ROLES } from '@krishi/shared';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);

router.post(
  '/', 
  authenticate, 
  requireRole([ROLES.PROVIDER, ROLES.ADMIN]),
  validateRequest(createServiceSchema), 
  ServiceController.createService
);

router.put(
  '/:id', 
  authenticate, 
  requireRole([ROLES.PROVIDER, ROLES.ADMIN]),
  ServiceController.updateService
);

router.delete(
  '/:id', 
  authenticate, 
  requireRole([ROLES.PROVIDER, ROLES.ADMIN]),
  ServiceController.deleteService
);

export { router as serviceRoutes };
