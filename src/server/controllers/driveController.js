import { isAuthenticated, listDriveFolders, createFolderIfNotExists } from '../../../utils/driveUtils.js';

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
    
    const { folderName } = req.body;
    if (!folderName) {
      return res.status(400).json({ 
        error: 'Folder name is required' 
      });
    }
    
    const folder = await createFolderIfNotExists(folderName);
    res.json({ folder });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create folder' 
    });
  }
};