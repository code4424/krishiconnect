import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { createBookingSchema, ROLES } from '@krishi/shared';
import { z } from 'zod';

const router = Router();

router.post(
  '/', 
  authenticate, 
  requireRole([ROLES.FARMER]),
  validateRequest(createBookingSchema),
  BookingController.createBooking
);

router.get(
  '/', 
  authenticate, 
  BookingController.getBookings
);

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
});

router.patch(
  '/:id/status', 
  authenticate, 
  requireRole([ROLES.PROVIDER, ROLES.ADMIN]),
  validateRequest(updateStatusSchema),
  BookingController.updateStatus
);

export { router as bookingRoutes };
