import { Router } from 'express';
import { checkAuthStatus, getAuthUrl } from '../controllers/authController.js';

const router = Router();

// Check authentication status
router.get('/status', checkAuthStatus);

// Generate authentication URL
router.get('/url', getAuthUrl);

// Legacy alias for clients expecting /google
router.get('/google', getAuthUrl);

export default router;
