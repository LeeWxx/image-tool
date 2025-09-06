import sharp from 'sharp';
import crypto from 'crypto';
import { isAuthenticated, uploadImageToDrive } from '../../../utils/driveUtils.js';
import { IMAGE_CONFIG } from '../../config/index.js';

/**
 * Image optimization and upload
 */
export const optimizeAndUpload = async (req, res) => {
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

    // Prepare response data
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
  } catch (error) {
    res.status(500).json({ 
      error: 'Image processing failed' 
    });
  }
};