/**
 * Folder management module
 */
export class FolderManager {
  constructor() {
    this.folderSelect = document.getElementById('folder-select');
    this.refreshButton = document.getElementById('refresh-folders');
    this.createButton = document.getElementById('create-folder');
    
    this.init();
  }

  init() {
    // Button event listeners
    this.refreshButton?.addEventListener('click', () => this.loadFolders());
    this.createButton?.addEventListener('click', () => this.createNewFolder());
    
    // Load folders on authentication success
    window.addEventListener('auth-success', () => this.loadFolders());
  }

  /**
   * Load folder list
   */
  async loadFolders() {
    try {
      const response = await fetch('/api/drive/folders');
      if (!response.ok) {
        throw new Error('Failed to fetch folder list.');
      }
      
      const data = await response.json();
      this.updateFolderList(data.folders);
    } catch (error) {
      // Error loading folder list
    }
  }

  /**
   * Update folder list
   */
  updateFolderList(folders) {
    // Clear existing options
    this.folderSelect.innerHTML = '<option value="">Root Folder</option>';
    
    // Add folder list
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      this.folderSelect.appendChild(option);
    });
  }

  /**
   * Create new folder
   */
  async createNewFolder() {
    const folderName = prompt('Enter new folder name:');
    if (!folderName) return;
    
    try {
      const response = await fetch('/api/drive/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      const data = await response.json();
      alert(`Folder "${data.folder.name}" created successfully.`);
      
      // Refresh folder list
      await this.loadFolders();
      
      // Select newly created folder
      this.folderSelect.value = data.folder.id;
    } catch (error) {
      // Error creating folder
      alert('Failed to create folder.');
    }
  }

  /**
   * Return selected folder ID
   */
  getSelectedFolderId() {
    return this.folderSelect?.value || null;
  }
}