import type { DriveFolder, DriveItem } from '../types.ts';

export type FoldersResponse = {
  folders: DriveFolder[];
};

export type CreateFolderResponse = {
  folder: DriveFolder;
};

export type FolderItemsResponse = {
  items: DriveItem[];
};

export async function loadFolders(signal?: AbortSignal): Promise<DriveFolder[]> {
  const response = await fetch('/api/drive/folders', { signal });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load folders (${response.status}): ${text}`);
  }
  const data: FoldersResponse = await response.json();
  return data.folders || [];
}

export async function createFolder(folderName: string, parentId: string | null = null): Promise<DriveFolder> {
  const response = await fetch('/api/drive/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderName, parentId })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create folder (${response.status}): ${text}`);
  }

  const data: CreateFolderResponse = await response.json();
  return data.folder;
}

export async function loadFolderItems(parentId: string | null = null, signal?: AbortSignal): Promise<DriveItem[]> {
  const params = new URLSearchParams();
  if (parentId) {
    params.set('parentId', parentId);
  }

  const query = params.toString();
  const response = await fetch(query ? `/api/drive/items?${query}` : '/api/drive/items', { signal });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load folder items (${response.status}): ${text}`);
  }
  const data: FolderItemsResponse = await response.json();
  return data.items || [];
}
