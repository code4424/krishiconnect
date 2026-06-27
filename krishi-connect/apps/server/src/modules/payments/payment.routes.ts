import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { idempotencyCheck } from '../../middleware/idempotency.js';

const router = Router();

router.post('/create-order', authenticate, idempotencyCheck, PaymentController.createOrder);
router.post('/verify', authenticate, PaymentController.verify);
router.post('/webhook', PaymentController.webhook);
router.get('/history', authenticate, PaymentController.history);

export { router as paymentRoutes };
