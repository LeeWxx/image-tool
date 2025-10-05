import { isAuthenticated, listDriveFolders, listDriveItems, createFolderIfNotExists } from '../utils/driveUtils.js';

/**
 * Get folder list
 */
export const getFolders = async (req, res) => {
  try {
    if (!isAuthenticated()) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    const folders = await listDriveFolders();
    res.json({ folders });
  } catch (error) {
    console.error('[Drive] Failed to fetch folder list:', error?.message || error);
    res.status(500).json({ 
      error: 'Failed to fetch folder list' 
    });
  }
};

/**
 * Create folder
 */
export const createFolder = async (req, res) => {
  try {
    if (!isAuthenticated()) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    const { folderName, name, parentId = null } = req.body;
    const targetName = folderName || name;

    if (!targetName) {
      return res.status(400).json({ 
        error: 'Folder name is required' 
      });
    }
    
    const folder = await createFolderIfNotExists(targetName, parentId);
    res.json({ folder });
  } catch (error) {
    console.error('[Drive] Failed to create folder:', error?.message || error);
    res.status(500).json({ 
      error: 'Failed to create folder' 
    });
  }
};

/**
 * Get items inside a folder
 */
export const getFolderItems = async (req, res) => {
  try {
    if (!isAuthenticated()) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const parentId = req.query.parentId || 'root';
    const items = await listDriveItems(parentId);
    res.json({ items });
  } catch (error) {
    console.error('[Drive] Failed to fetch folder items:', error?.message || error);
    res.status(500).json({
      error: 'Failed to fetch folder items'
    });
  }
};
