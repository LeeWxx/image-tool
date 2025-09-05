const dropArea = document.getElementById('drop-area');
const results = document.getElementById('results');
const authStatus = document.getElementById('auth-status');
const authButton = document.getElementById('auth-button');
const folderSelector = document.getElementById('folder-selector');
const folderSelect = document.getElementById('folder-select');
const refreshFoldersBtn = document.getElementById('refresh-folders');
const createFolderBtn = document.getElementById('create-folder');

// Check authentication status
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated) {
      authStatus.textContent = '✅ Google Drive Connected';
      authStatus.classList.add('authenticated');
      authButton.style.display = 'none';
      folderSelector.style.display = 'block';
      await loadFolders();
    } else {
      authStatus.textContent = '❌ Google Drive Not Connected';
      authStatus.classList.remove('authenticated');
      authButton.style.display = 'block';
      folderSelector.style.display = 'none';
    }
  } catch (error) {
    authStatus.textContent = '⚠️ Failed to check auth status';
  }
}

// Get authentication URL
async function getAuthUrl(){
  try {
    const response = await fetch('/api/auth/url');
    const data = await response.json();
    return data.url;
  } catch (error) {
    return null;
  }
}

// Authentication button click event
authButton.addEventListener('click', async () => {
  const url = await getAuthUrl();
  if (url) {
    window.open(url, '_blank', 'width=600,height=700');
    
    // Check status after auth window closes (every 5 seconds)
    const checkInterval = setInterval(async () => {
      await checkAuthStatus();
      const status = await fetch('/api/auth/status').then(res => res.json());
      if (status.authenticated) {
        clearInterval(checkInterval);
      }
    }, 5000);
  } else {
    alert('Failed to get authentication URL.');
  }
});

// Load Google Drive folders list
async function loadFolders() {
  try {
    const response = await fetch('/api/drive/folders');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    const folders = data.folders;
    
    // Clear existing options
    folderSelect.innerHTML = '<option value="">Root Folder</option>';
    
    // Add folder list
    if (folders && Array.isArray(folders)) {
      folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
      });
    }
  } catch (error) {
    // Error loading folders
  }
}

// Refresh folders button
refreshFoldersBtn.addEventListener('click', async () => {
  await loadFolders();
});

// Create new folder
createFolderBtn.addEventListener('click', async () => {
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
    await loadFolders();
    
    // Auto-select the newly created folder
    folderSelect.value = data.folder.id;
  } catch (error) {
    alert('Failed to create folder.');
  }
});

// Check URL parameters
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const authResult = urlParams.get('auth');
  
  if (authResult === 'success') {
    alert('Google Drive authentication completed.');
    checkAuthStatus();
    // Remove parameters
    window.history.replaceState({}, document.title, '/');
  } else if (authResult === 'error') {
    alert('Google Drive authentication failed.');
    // Remove parameters
    window.history.replaceState({}, document.title, '/');
  }
}

async function handleFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    
    // Add download link
    const li = document.createElement('li');
    li.textContent = `${file.name} processing...`;
    results.prepend(li);
    
    // Fetch data (including selected folder ID)
    const selectedFolderId = folderSelect ? folderSelect.value : null;
    const headers = { 'Content-Type': file.type };
    if (selectedFolderId) {
      headers['X-Folder-Id'] = selectedFolderId;
    }
    
    const response = await fetch('/optimize', {
      method: 'POST',
      headers: headers,
      body: buffer
    });
    
    if (!response.ok) {
      throw new Error('Image optimization failed');
    }
    
    // Extract filename from response 
    let filename = 'image.webp';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    // Get Drive info
    let driveInfo = null;
    const driveInfoHeader = response.headers.get('X-Drive-Info');
    if (driveInfoHeader) {
      try {
        driveInfo = JSON.parse(driveInfoHeader);
      } catch (e) {
        // Error parsing Drive info
      }
    }
    
    // Extract blob from response
    const blob = await response.blob();
    
    // Create Blob URL
    const url = URL.createObjectURL(blob);
    
    // Generate HTML
    let html = `
      <span>${file.name}</span>
      <div class="actions">
        <a href="${url}" download="${filename}" class="download-btn">Download</a>
    `;
    
    // Add link if Drive upload successful
    if (driveInfo && driveInfo.drive && driveInfo.drive.webViewLink) {
      html += `
        <a href="${driveInfo.drive.webViewLink}" target="_blank" class="drive-btn">
          View in Drive
        </a>
      `;
    }
    
    html += `</div>`;
    li.innerHTML = html;
  } catch (error) {
    alert('An error occurred while processing the image.');
  }
}

// Handle drop events
['dragenter','dragover'].forEach(evt => {
  dropArea.addEventListener(evt, e => {
    e.preventDefault();
    dropArea.classList.add('drag-over');
  });
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
  [...e.dataTransfer.files].forEach(handleFile);
});

// Handle paste events
window.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      handleFile(file);
    }
  }
});

// Execute on page load
window.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  checkUrlParams();
});
