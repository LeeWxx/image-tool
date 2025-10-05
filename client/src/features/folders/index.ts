export { ROOT_ID, ROOT_LABEL } from './types.ts';
export type { DriveFolder, DriveItem } from './types.ts';

export {
  useFolderTree,
  setFolders,
  mergeFolders,
  resetFolders,
  navigateTo,
  navigateToParent,
  resetToRoot,
  selectUploadTarget
} from './state/folderTree.svelte.ts';

export {
  useFolderItems,
  fetchItemsFor,
  refreshCurrentFolderItems,
  resetItems,
  isDriveFolder
} from './state/folderItems.svelte.ts';

export { default as FolderSelector } from './ui/FolderSelector.svelte';
export { default as DriveItemCard } from './ui/DriveItemCard.svelte';
