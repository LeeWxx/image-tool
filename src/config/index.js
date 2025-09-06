import dotenv from 'dotenv';
dotenv.config();

export const GOOGLE_DRIVE_CONFIG = {
  // OAuth 2.0 Client credentials from environment variables
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  // Google Drive folder ID for uploads (optional)
  FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
  // Required permission scopes
  SCOPES: [
    'https://www.googleapis.com/auth/drive'
  ]
};

export const IMAGE_CONFIG = {
  MAX_WIDTH: parseInt(process.env.MAX_IMAGE_WIDTH) || 1024,
  WEBP_QUALITY: parseInt(process.env.WEBP_QUALITY) || 80
};

export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT) || 3000
}; 