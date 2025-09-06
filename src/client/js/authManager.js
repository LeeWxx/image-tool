/**
 * Authentication management module
 */
export class AuthManager {
  constructor() {
    this.authStatus = document.getElementById('auth-status');
    this.authButton = document.getElementById('auth-button');
    this.folderSelector = document.getElementById('folder-selector');
    
    this.init();
  }

  init() {
    // Authentication button event listener
    this.authButton?.addEventListener('click', () => this.handleAuthClick());
    
    // Check URL parameters
    this.checkUrlParams();
    
    // Check initial authentication status
    this.checkAuthStatus();
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (data.authenticated) {
        this.setAuthenticatedUI();
      } else {
        this.setUnauthenticatedUI();
      }
      
      return data.authenticated;
    } catch (error) {
      // Error checking authentication status
      this.authStatus.textContent = '⚠️ Failed to check auth status';
      return false;
    }
  }

  /**
   * Set authenticated state UI
   */
  setAuthenticatedUI() {
    this.authStatus.textContent = '✅ Google Drive Connected';
    this.authStatus.classList.add('authenticated');
    this.authButton.style.display = 'none';
    this.folderSelector.style.display = 'block';
    
    // Trigger folder list load event
    window.dispatchEvent(new CustomEvent('auth-success'));
  }

  /**
   * Set unauthenticated state UI
   */
  setUnauthenticatedUI() {
    this.authStatus.textContent = '❌ Google Drive Not Connected';
    this.authStatus.classList.remove('authenticated');
    this.authButton.style.display = 'block';
    this.folderSelector.style.display = 'none';
  }

  /**
   * Handle authentication button click
   */
  async handleAuthClick() {
    try {
      const response = await fetch('/api/auth/url');
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank', 'width=600,height=700');
        
        // Check authentication completion (every 5 seconds)
        const checkInterval = setInterval(async () => {
          const authenticated = await this.checkAuthStatus();
          if (authenticated) {
            clearInterval(checkInterval);
          }
        }, 5000);
      } else {
        alert('Failed to get authentication URL.');
      }
    } catch (error) {
      // Error fetching authentication URL
      alert('Failed to get authentication URL.');
    }
  }

  /**
   * Check URL parameters
   */
  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const authResult = urlParams.get('auth');
    
    if (authResult === 'success') {
      alert('Google Drive authentication completed.');
      this.checkAuthStatus();
      window.history.replaceState({}, document.title, '/');
    } else if (authResult === 'error') {
      alert('Google Drive authentication failed.');
      window.history.replaceState({}, document.title, '/');
    }
  }
}