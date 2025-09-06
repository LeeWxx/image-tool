import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { SERVER_CONFIG } from './src/config/index.js';
import authRoutes from './src/server/routes/authRoutes.js';
import driveRoutes from './src/server/routes/driveRoutes.js';
import imageRoutes from './src/server/routes/imageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = SERVER_CONFIG.PORT;

// Middleware setup
app.use(bodyParser.raw({ type: ['image/*'], limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/', imageRoutes);

// OAuth callback route (special case)
app.get('/auth/google/callback', async (req, res) => {
  const { handleOAuthCallback } = await import('./src/server/controllers/authController.js');
  return handleOAuthCallback(req, res);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));