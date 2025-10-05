import { loadFolderItems } from '../services/api.ts';
import { ROOT_ID, type DriveItem } from '../types.ts';
import { useFolderTree } from './folderTree.svelte.ts';

let entries = $state<DriveItem[]>([]);
let isLoading = $state(false);
let errorMessage = $state('');
let currentParentId: string | null = ROOT_ID;
let requestToken = 0;

const tree = useFolderTree();
const sortedEntries = $derived(sortDriveItems(entries));

export function useFolderItems() {
  return {
    get items() {
      return entries;
    },
    get sortedItems() {
      return sortedEntries;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return errorMessage;
    },
    get parentId() {
      return currentParentId;
    }
  };
}

export async function fetchItemsFor(parentId: string | null) {
  const token = ++requestToken;
  currentParentId = parentId ?? ROOT_ID;
  isLoading = true;
  errorMessage = '';

  try {
    const data = await loadFolderItems(parentId ?? null);
    if (token === requestToken) {
      entries = data;
    }
  } catch (error) {
    if (token === requestToken) {
      entries = [];
      errorMessage = "Couldn't load this folder.";
    }
    throw error;
  } finally {
    if (token === requestToken) {
      isLoading = false;
    }
  }
}

export async function refreshCurrentFolderItems() {
  const folderId = tree.currentFolderId;
  const parentId = folderId === ROOT_ID ? null : folderId;
  try {
    await fetchItemsFor(parentId);
  } catch (error) {
    // errorMessage already handled in fetchItemsFor
  }
}

export function resetItems() {
  entries = [];
  errorMessage = '';
  isLoading = false;
  currentParentId = ROOT_ID;
  requestToken = 0;
}

export function isDriveFolder(item: DriveItem) {
  const type = (item.mimeType || '').toLowerCase();
  if (!type) {
    return false;
  }
  return type.includes('application/vnd.google-apps.folder');
}

function sortDriveItems(items: DriveItem[]) {
  const folders: DriveItem[] = [];
  const files: DriveItem[] = [];

  for (const item of items) {
    if (isDriveFolder(item)) {
      folders.push(item);
    } else {
      files.push(item);
    }
  }

  const collator = new Intl.Collator('ko', { sensitivity: 'base' });

  const sortByName = (a: DriveItem, b: DriveItem) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    return collator.compare(nameA, nameB);
  };

  folders.sort(sortByName);
  files.sort(sortByName);

  return [...folders, ...files];
}
