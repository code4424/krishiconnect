import { Router } from 'express';
import { GeocodeController } from './geocode.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/search', GeocodeController.search);
router.get('/reverse', GeocodeController.reverse);

export { router as geocodeRoutes };
