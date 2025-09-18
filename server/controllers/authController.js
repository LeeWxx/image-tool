import { getAuthUrl as getDriveAuthUrl, getTokenFromCode, isAuthenticated } from '../utils/driveUtils.js';

/**
 * Check authentication status
 */
export const checkAuthStatus = (req, res) => {
  try {
    const authenticated = isAuthenticated();
    res.json({ authenticated });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check authentication status' 
    });
  }
};

/**
 * Generate authentication URL
 */
export const getAuthUrl = (req, res) => {
  try {
    const url = getDriveAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate authentication URL' 
    });
  }
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (req, res) => {
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
};