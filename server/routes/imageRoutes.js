import { Router } from 'express';
import { optimizeAndUpload } from '../controllers/imageController.js';

const router = Router();

// Image optimization and upload
router.post('/upload', optimizeAndUpload);

export default router;