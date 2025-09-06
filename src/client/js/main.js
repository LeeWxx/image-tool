import { AuthManager } from './authManager.js';
import { FolderManager } from './folderManager.js';
import { ImageUploader } from './imageUploader.js';

/**
 * 애플리케이션 초기화
 */
class App {
  constructor() {
    this.authManager = new AuthManager();
    this.folderManager = new FolderManager();
    this.imageUploader = new ImageUploader(this.folderManager);
  }
}

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  new App();
});