import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_DRIVE_CONFIG } from '../config/index.js';

// Token storage path
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
  return new OAuth2Client(
    GOOGLE_DRIVE_CONFIG.CLIENT_ID,
    GOOGLE_DRIVE_CONFIG.CLIENT_SECRET,
    GOOGLE_DRIVE_CONFIG.REDIRECT_URI
  );
}

/**
 * Generate authentication URL
 */
export function getAuthUrl() {
  const oAuth2Client = createOAuth2Client();
  
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_DRIVE_CONFIG.SCOPES,
    prompt: 'consent'
  });
  
  return authUrl;
}

/**
 * Get token from authorization code
 */
export async function getTokenFromCode(code) {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  
  // Save token
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  
  return tokens;
}

/**
 * Get saved token
 */
export function getSavedToken() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    }
  } catch (err) {
    // Error reading token file
  }
  return null;
}

/**
 * Get authenticated Drive client
 */
export function getDriveClient() {
  const oAuth2Client = createOAuth2Client();
  const token = getSavedToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please complete authentication first.');
  }
  
  oAuth2Client.setCredentials(token);
  const driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
  
  return driveClient;
}

/**
 * Upload image to Google Drive
 */
export async function uploadImageToDrive(buffer, filename, mimeType = 'image/webp', folderId = null) {
  try {
    const drive = getDriveClient();
    
    // Folder ID priority: parameter > config file
    const targetFolderId = folderId || GOOGLE_DRIVE_CONFIG.FOLDER_ID;
    
    const fileMetadata = {
      name: filename,
      // Add folder ID to parents array to save in specific folder
      ...(targetFolderId && { 
        parents: [targetFolderId] 
      })
    };
    
    const media = {
      mimeType,
      body: Readable.from(buffer)
    };
    
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Check authentication status
 */
export function isAuthenticated() {
  return getSavedToken() !== null;
}

/**
 * Get Google Drive folder list
 */
export async function listDriveFolders() {
  try {
    const drive = getDriveClient();
    const query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, parents)',
      orderBy: 'name',
      pageSize: 100
    });
    
    const folders = response.data.files || [];
    return folders;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload image to specific folder (includes folder creation)
 */
export async function createFolderIfNotExists(folderName) {
  try {
    const drive = getDriveClient();
    
    // Check existing folder
    const existingFolders = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 1
    });
    
    if (existingFolders.data.files && existingFolders.data.files.length > 0) {
      return existingFolders.data.files[0];
    }
    
    // Create folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name'
    });
    
    return folder.data;
  } catch (error) {
    throw error;
  }
} 