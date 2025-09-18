<script>
  import { folders, selectedFolder } from './folders.js';
  import { isAuthenticated } from '../auth/auth.js';
  import { loadFolders, createFolder } from './api.js';

  async function refreshFolders() {
    const folderList = await loadFolders();
    folders.set(folderList);
  }

  async function handleCreateFolder() {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const success = await createFolder(folderName);
      if (success) {
        await refreshFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  }
</script>

{#if $isAuthenticated}
  <div class="folder-selector">
    <label for="folder-select">Upload Folder:</label>
    <select id="folder-select" bind:value={$selectedFolder}>
      <option value="">Root Folder</option>
      {#each $folders as folder}
        <option value={folder.id}>{folder.name}</option>
      {/each}
    </select>
    <button on:click={refreshFolders}>Refresh Folders</button>
    <button on:click={handleCreateFolder}>Create New Folder</button>
  </div>
{/if}

<style>
  .folder-selector {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
  }

  select {
    padding: 5px;
  }

  button {
    padding: 5px 10px;
    cursor: pointer;
  }
</style>