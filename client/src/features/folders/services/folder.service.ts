import { loadFolders, createFolder as apiCreateFolder } from './api.ts';
import {
  setFolders,
  useFolderTree,
  ROOT_ID,
  resetFolders,
  navigateTo,
  resetToRoot
} from '../index.ts';
import { fetchItemsFor, refreshCurrentFolderItems, resetItems } from '../state/folderItems.svelte.ts';

export async function refreshFolderTree() {
  const folders = await loadFolders();
  setFolders(folders);
  return folders;
}

export async function refreshItemsForCurrentFolder() {
  await refreshCurrentFolderItems();
}

export async function refreshItemsForParent(parentId: string | null) {
  await fetchItemsFor(parentId);
}

export async function syncDriveState() {
  await refreshFolderTree();
  await refreshItemsForCurrentFolder();
}

export async function createFolder(name: string, parentId: string | null) {
  const folder = await apiCreateFolder(name, parentId);
  await refreshFolderTree();

  const tree = useFolderTree();
  if (folder && folder.id) {
    navigateTo(folder.id);
    await refreshCurrentFolderItems();
  } else if (tree.currentFolderId === parentId || (parentId === null && tree.currentFolderId === ROOT_ID)) {
    await refreshCurrentFolderItems();
  }

  return folder;
}

export function clearDriveState() {
  resetFolders();
  resetItems();
  resetToRoot();
}
