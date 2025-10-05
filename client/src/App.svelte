<script lang="ts">
  import { onMount } from 'svelte';
  import { AuthStatus, loadAuthStatus } from './features/auth/index.ts';
  import { FolderSelector, useFolderTree } from './features/folders/index.ts';
  import { ResultList, uploadFiles } from './features/upload/index.ts';
  import { syncDriveState, clearDriveState, refreshItemsForCurrentFolder } from './features/folders/services/folder.service.ts';

  const tree = useFolderTree();

  onMount(async () => {
    await initializeAuth();
  });

  async function initializeAuth() {
    try {
      const authenticated = await loadAuthStatus();

      if (authenticated) {
        await syncDriveState();
      } else {
        clearDriveState();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearDriveState();
    }
  }

  async function handleFiles(event) {
    const files: File[] = event.detail;
    const targetFolderId = tree.uploadTargetId || '';

    const { successCount } = await uploadFiles(files, targetFolderId);

    if (successCount > 0) {
      await refreshItemsForCurrentFolder();
    }
  }
</script>

<main>
  <h1>Image Optimization Tool</h1>

  <AuthStatus />
  <FolderSelector on:files={handleFiles} />
  <ResultList />
</main>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    text-align: center;
    color: #333;
  }
</style>
