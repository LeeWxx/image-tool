export async function loadFolders() {
  const response = await fetch('/api/drive/folders');
  const data = await response.json();
  return data.folders || [];
}

export async function createFolder(folderName) {
  const response = await fetch('/api/drive/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: folderName })
  });
  return response.ok;
}