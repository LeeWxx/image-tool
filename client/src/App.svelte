<script>
  import { onMount } from 'svelte';
  import AuthStatus from './features/auth/AuthStatus.svelte';
  import FolderSelector from './features/folders/FolderSelector.svelte';
  import DropZone from './features/upload/DropZone.svelte';
  import ResultList from './features/upload/ResultList.svelte';

  import { authStatus, isAuthenticated } from './features/auth/auth.js';
  import { folders, selectedFolder } from './features/folders/folders.js';
  import { results } from './features/upload/results.js';

  import { checkAuthStatus } from './features/auth/api.js';
  import { loadFolders } from './features/folders/api.js';
  import { uploadImage } from './features/upload/api.js';

  onMount(async () => {
    await initializeAuth();
  });

  async function initializeAuth() {
    try {
      const data = await checkAuthStatus();

      if (data.authenticated) {
        authStatus.set('Connected to Google Drive');
        isAuthenticated.set(true);
        const folderList = await loadFolders();
        folders.set(folderList);
      } else {
        authStatus.set('Not connected');
        isAuthenticated.set(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      authStatus.set('Connection check failed');
    }
  }

  async function handleFiles(event) {
    const files = event.detail;

    for (let file of files) {
      // Add processing status
      const tempId = Date.now() + Math.random();
      results.update(r => [...r, {
        id: tempId,
        originalName: file.name,
        status: 'processing',
        originalSize: file.size
      }]);

      try {
        const { blob, url, info } = await uploadImage(file, $selectedFolder);

        // Update result
        results.update(list => list.map(r =>
          r.id === tempId ? {
            ...r,
            status: 'completed',
            optimizedUrl: url,
            optimizedSize: info.size || blob.size,
            filename: info.filename || 'optimized.webp',
            driveLink: info.drive?.webViewLink
          } : r
        ));
      } catch (error) {
        console.error('Error uploading file:', error);
        // Update to error status
        results.update(list => list.map(r =>
          r.id === tempId ? { ...r, status: 'error' } : r
        ));
      }
    }
  }
</script>

<main>
  <h1>Image Optimization Tool</h1>

  <AuthStatus />
  <FolderSelector />
  <DropZone on:files={handleFiles} />
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