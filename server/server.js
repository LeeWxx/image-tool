import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { SERVER_CONFIG } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = SERVER_CONFIG.PORT;

// Middleware setup
app.use(bodyParser.raw({ type: ['image/*'], limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api', imageRoutes);

// OAuth callback route (special case)
app.get('/auth/google/callback', async (req, res) => {
  const { handleOAuthCallback } = await import('./controllers/authController.js');
  return handleOAuthCallback(req, res);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));