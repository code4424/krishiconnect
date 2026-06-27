import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../../middleware/rateLimiter.js';
import { validateRequest } from '../../middleware/validate.js';
import { loginSchema, registerSchema } from '@krishi/shared';

const router = Router();

router.post('/register', registerLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', loginLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.put('/language', authenticate, AuthController.updateLanguage);

// Stubs for remaining routes
router.put('/change-password', authenticate, (req, res) => res.json({ success: true, message: 'Stub' }));
router.post('/forgot-password', (req, res) => res.json({ success: true, message: 'Reset link sent' }));
router.post('/reset-password', (req, res) => res.json({ success: true, message: 'Password reset successful' }));

export { router as authRoutes };
