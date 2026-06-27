import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

// Max 5 images
router.post('/images', authenticate, upload.array('images', 5), UploadController.uploadImages);

export { router as uploadRoutes };
