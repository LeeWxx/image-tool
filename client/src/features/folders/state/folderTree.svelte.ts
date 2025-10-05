import type { DriveFolder } from '../types.ts';
import { ROOT_ID, ROOT_LABEL } from '../types.ts';

let folderList = $state<DriveFolder[]>([]);
let currentFolderId = $state<string>(ROOT_ID);
let uploadTargetId = $state<string | null>(null);

const folderMap = $derived(buildFolderMap(folderList));
const breadcrumb = $derived(buildBreadcrumb(currentFolderId, folderMap));
const currentFolderName = $derived(getFolderTitle(currentFolderId, folderMap));
const isAtRoot = $derived(currentFolderId === ROOT_ID);
const parentFolderId = $derived(getPrimaryParentId(currentFolderId, folderMap));

export function setFolders(list: DriveFolder[]) {
  folderList = list;
  ensureValidSelection(list);
}

export function mergeFolders(list: DriveFolder[]) {
  const next = new Map(folderMap);
  for (const folder of list) {
    next.set(folder.id, folder);
  }
  folderList = Array.from(next.values());
  ensureValidSelection(folderList);
}

export function resetFolders() {
  folderList = [];
  resetToRoot();
  uploadTargetId = null;
}

export function navigateTo(folderId: string | null) {
  const target = folderId ?? ROOT_ID;
  currentFolderId = target;
  uploadTargetId = target === ROOT_ID ? null : target;
}

export function resetToRoot() {
  navigateTo(null);
}

export function navigateToParent() {
  const parentId = getPrimaryParentId(currentFolderId, folderMap);
  navigateTo(parentId);
}

export function selectUploadTarget(folderId: string | null) {
  uploadTargetId = folderId && folderId !== ROOT_ID ? folderId : null;
}

export function useFolderTree() {
  return {
    get folders() {
      return folderList;
    },
    get currentFolderId() {
      return currentFolderId;
    },
    get uploadTargetId() {
      return uploadTargetId;
    },
    get breadcrumb() {
      return breadcrumb;
    },
    get currentFolderName() {
      return currentFolderName;
    },
    get isAtRoot() {
      return isAtRoot;
    },
    get parentFolderId() {
      return parentFolderId;
    }
  };
}

function buildFolderMap(list: DriveFolder[]) {
  const map = new Map<string, DriveFolder>();
  for (const folder of list) {
    map.set(folder.id, folder);
  }
  return map;
}

function buildBreadcrumb(folderId: string, map: Map<string, DriveFolder>) {
  if (folderId === ROOT_ID) {
    return [] as DriveFolder[];
  }

  const result: DriveFolder[] = [];
  let currentId: string | null = folderId;

  while (currentId && currentId !== ROOT_ID) {
    const node = map.get(currentId);
    if (!node) {
      break;
    }
    result.unshift(node);
    currentId = getPrimaryParentId(currentId, map);
  }

  return result;
}

function getPrimaryParentId(folderId: string, map: Map<string, DriveFolder>) {
  if (folderId === ROOT_ID) {
    return null;
  }

  const folder = map.get(folderId);
  if (!folder) {
    return null;
  }

  const parents = folder.parents ?? [];
  if (parents.length === 0) {
    return ROOT_ID;
  }

  const first = parents[0];
  if (!first) {
    return ROOT_ID;
  }

  return map.has(first) ? first : ROOT_ID;
}

function getFolderTitle(folderId: string, map: Map<string, DriveFolder>) {
  if (folderId === ROOT_ID) {
    return ROOT_LABEL;
  }
  return map.get(folderId)?.name ?? 'Selected folder';
}

function ensureValidSelection(list: DriveFolder[]) {
  if (currentFolderId !== ROOT_ID && !list.some(folder => folder.id === currentFolderId)) {
    currentFolderId = ROOT_ID;
  }

  if (uploadTargetId && uploadTargetId !== ROOT_ID && !list.some(folder => folder.id === uploadTargetId)) {
    uploadTargetId = null;
  }
}

export { ROOT_ID, ROOT_LABEL };
