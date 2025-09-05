import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import fs from 'fs';
import { 
  getAuthUrl, 
  getTokenFromCode, 
  isAuthenticated, 
  uploadImageToDrive,
  listDriveFolders,
  createFolderIfNotExists
} from './utils/driveUtils.js';
import { SERVER_CONFIG, IMAGE_CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = SERVER_CONFIG.PORT;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(bodyParser.raw({ type: ['image/*'], limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check authentication status API
app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: isAuthenticated() });
});

// Generate authentication URL API
app.get('/api/auth/url', (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Handle OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }
    
    await getTokenFromCode(code);
    res.redirect('/?auth=success');
  } catch (error) {
    res.redirect('/?auth=error');
  }
});

// Google Drive folders list API
app.get('/api/drive/folders', async (req, res) => {
  try {
    if (!isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const folders = await listDriveFolders();
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folder list' });
  }
});

// Create folder API
app.post('/api/drive/folder', async (req, res) => {
  try {
    if (!isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { folderName } = req.body;
    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const folder = await createFolderIfNotExists(folderName);
    res.json({ folder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

app.post('/optimize', async (req, res) => {
  try {
    // Extract folder ID from headers
    const folderId = req.headers['x-folder-id'];
    const buffer = req.body;
    
    // Generate hash (SHA-256, first 16 chars)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const filename = `${hash}.webp`;

    // Optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: IMAGE_CONFIG.MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: IMAGE_CONFIG.WEBP_QUALITY })
      .toBuffer();

    // Try uploading to Google Drive
    let driveFileInfo = null;
    if (isAuthenticated()) {
      try {
        driveFileInfo = await uploadImageToDrive(optimizedBuffer, filename, 'image/webp', folderId);
      } catch (uploadError) {
        // Continue even if upload fails (still provide local download)
      }
    }

    // Add Drive info to response
    const responseData = {
      filename,
      size: optimizedBuffer.length,
      drive: driveFileInfo
    };

    // Set download response headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('X-Drive-Info', JSON.stringify(responseData));
    
    // Send image buffer
    res.send(optimizedBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

