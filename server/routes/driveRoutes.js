import { Router } from 'express';
import { getFolders, createFolder } from '../controllers/driveController.js';

const router = Router();

// Get folder list
router.get('/folders', getFolders);

// Create folder
router.post('/folder', createFolder);

export default router;