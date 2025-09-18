export async function uploadImage(file, folderId) {
  const arrayBuffer = await file.arrayBuffer();

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
      'X-Folder-Id': folderId || ''
    },
    body: arrayBuffer
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const driveInfo = response.headers.get('X-Drive-Info');
  const info = driveInfo ? JSON.parse(driveInfo) : {};

  return {
    blob,
    url,
    info
  };
}