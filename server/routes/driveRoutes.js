import { Router } from 'express';
import { getFolders, createFolder, getFolderItems } from '../controllers/driveController.js';

const router = Router();

// Get folder list
router.get('/folders', getFolders);

// Create folder
router.post('/folder', createFolder);

// Get items inside folder
router.get('/items', getFolderItems);

export default router;
