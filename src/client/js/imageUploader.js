/**
 * 이미지 업로드 처리 모듈
 */
export class ImageUploader {
  constructor(folderManager) {
    this.folderManager = folderManager;
    this.dropArea = document.getElementById('drop-area');
    this.results = document.getElementById('results');
    
    this.init();
  }

  init() {
    this.setupDragAndDrop();
    this.setupPasteHandler();
  }

  /**
   * 드래그 앤 드롭 설정
   */
  setupDragAndDrop() {
    if (!this.dropArea) return;
    
    // 드래그 이벤트 처리
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    // 드래그 시각 효과
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, () => {
        this.dropArea.classList.add('drag-over');
      });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, () => {
        this.dropArea.classList.remove('drag-over');
      });
    });
    
    // 드롭 처리
    this.dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });
    
    // 클릭으로 파일 선택
    this.dropArea.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e) => {
        this.handleFiles(e.target.files);
      };
      input.click();
    });
  }

  /**
   * 붙여넣기 처리
   */
  setupPasteHandler() {
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData.items;
      
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          this.processFile(file);
        }
      }
    });
  }

  /**
   * 파일 처리
   */
  handleFiles(files) {
    [...files].forEach(file => {
      if (file.type.startsWith('image/')) {
        this.processFile(file);
      }
    });
  }

  /**
   * 단일 파일 처리
   */
  async processFile(file) {
    try {
      // UI 업데이트
      const li = this.createResultItem(file.name, '처리 중...');
      this.results.prepend(li);
      
      // 파일 읽기
      const buffer = await file.arrayBuffer();
      
      // 폴더 ID 가져오기
      const folderId = this.folderManager.getSelectedFolderId();
      
      // 헤더 설정
      const headers = { 'Content-Type': file.type };
      if (folderId) {
        headers['X-Folder-Id'] = folderId;
      }
      
      // 서버로 전송
      const response = await fetch('/optimize', {
        method: 'POST',
        headers: headers,
        body: buffer
      });
      
      if (!response.ok) {
        throw new Error('이미지 최적화 실패');
      }
      
      // 응답 처리
      const blob = await response.blob();
      const filename = this.extractFilename(response.headers);
      const driveInfo = this.extractDriveInfo(response.headers);
      
      // UI 업데이트
      this.updateResultItem(li, filename, blob, driveInfo);
    } catch (error) {
      console.error('파일 처리 오류:', error);
      alert(`파일 처리 중 오류 발생: ${file.name}`);
    }
  }

  /**
   * 결과 아이템 생성
   */
  createResultItem(filename, status) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${filename}</span>
      <span>${status}</span>
    `;
    return li;
  }

  /**
   * 결과 아이템 업데이트
   */
  updateResultItem(li, filename, blob, driveInfo) {
    const downloadUrl = URL.createObjectURL(blob);
    const size = (blob.size / 1024).toFixed(2) + ' KB';
    
    let html = `
      <span>${filename} (${size})</span>
      <div class="actions">
        <a href="${downloadUrl}" download="${filename}" class="download-btn">다운로드</a>
    `;
    
    if (driveInfo && driveInfo.webViewLink) {
      html += `<a href="${driveInfo.webViewLink}" target="_blank" class="drive-btn">Drive에서 보기</a>`;
    }
    
    html += '</div>';
    li.innerHTML = html;
  }

  /**
   * 응답 헤더에서 파일명 추출
   */
  extractFilename(headers) {
    let filename = 'image.webp';
    const disposition = headers.get('Content-Disposition');
    
    if (disposition && disposition.includes('filename=')) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    return filename;
  }

  /**
   * 응답 헤더에서 Drive 정보 추출
   */
  extractDriveInfo(headers) {
    const driveInfoHeader = headers.get('X-Drive-Info');
    
    if (driveInfoHeader) {
      try {
        const info = JSON.parse(driveInfoHeader);
        return info.drive;
      } catch (e) {
        console.error('Drive 정보 파싱 오류:', e);
      }
    }
    
    return null;
  }
}