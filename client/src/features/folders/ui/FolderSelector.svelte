<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import DriveItemCard from './DriveItemCard.svelte';
  import type { DriveItem } from '../types.ts';
  import {
    ROOT_LABEL,
    ROOT_ID,
    useFolderTree,
    useFolderItems,
    navigateTo,
    resetToRoot,
    isDriveFolder
  } from '../index.ts';
  import {
    refreshFolderTree,
    refreshItemsForCurrentFolder,
    createFolder as createDriveFolder,
    syncDriveState
  } from '../services/folder.service.ts';
  import { dropTarget } from '../../upload/lib/dropTarget.ts';
  import { isImageFile, getImageFromClipboard } from '../../upload/lib/imageUtils.ts';
  import { useAuthState } from '../../auth/index.ts';

  const dispatch = createEventDispatcher<{ files: File[] }>();
  const tree = useFolderTree();
  const items = useFolderItems();
  const auth = useAuthState();
  const authenticated = $derived(auth.isAuthenticated);

  const crumbSegments = $derived([
    { id: ROOT_ID, name: ROOT_LABEL },
    ...tree.breadcrumb
  ]);
  const totalCrumbs = $derived(crumbSegments.length);

  let isBusy = $state(false);
  let bannerMessage = $state('');
  let isDragActive = $state(false);

  async function ensureItems() {
    if (!authenticated) {
      return;
    }
    await refreshItemsForCurrentFolder();
  }

  async function handleRefreshAll() {
    if (!authenticated) {
      return;
    }

    isBusy = true;
    bannerMessage = '';

    try {
      await syncDriveState();
    } catch (error) {
      console.error('Error refreshing drive state:', error);
      bannerMessage = 'Failed to refresh folder data.';
    } finally {
      isBusy = false;
    }
  }

  async function handleCreateFolder() {
    const folderName = prompt('Enter a name for the new folder');
    if (!folderName) {
      return;
    }

    isBusy = true;
    bannerMessage = '';

    try {
      const parentId = tree.isAtRoot ? null : tree.currentFolderId;
      await createDriveFolder(folderName, parentId);
    } catch (error) {
      console.error('Error creating folder:', error);
      bannerMessage = 'Unable to create the folder.';
    } finally {
      isBusy = false;
    }
  }

  async function changeFolder(targetId: string | null, index: number) {
    const nextId = targetId ?? ROOT_ID;
    if (tree.currentFolderId === nextId) {
      return;
    }

    if (index === 0) {
      resetToRoot();
    } else {
      navigateTo(nextId);
    }
    await ensureItems();
  }

  async function openItem(item: DriveItem) {
    if (isDriveFolder(item)) {
      navigateTo(item.id);
      await ensureItems();
    } else if (item.webViewLink) {
      window.open(item.webViewLink, '_blank', 'noopener');
    }
  }

  function handleUploadClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = event => {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;
      emitFiles(Array.from(target.files));
    };
    input.click();
  }

  function emitFiles(files: File[]) {
    const images = files.filter(isImageFile);
    if (images.length > 0) {
      dispatch('files', images);
    }
  }

  function handlePaste(event: ClipboardEvent) {
    const pasted = getImageFromClipboard(event.clipboardData?.items || []);
    if (pasted) {
      dispatch('files', [pasted]);
    }
  }

  function handleDroppedFiles(files: File[]) {
    emitFiles(files);
  }

  async function handleManualRefresh() {
    if (!get(isAuthenticated)) {
      return;
    }

    isBusy = true;
    bannerMessage = '';

    try {
      await refreshFolderTree();
      await ensureItems();
    } catch (error) {
      console.error('Error refreshing folders:', error);
      bannerMessage = 'Failed to refresh folder data.';
    } finally {
      isBusy = false;
    }
  }

  const dropOptions = {
    onFiles: handleDroppedFiles,
    onDragChange: (active: boolean) => {
      isDragActive = active;
    },
    onPaste: handlePaste
  };
</script>

{#if authenticated}
  <section
    class="drive-browser"
    class:dragging={isDragActive}
    aria-label="Google Drive browser"
    use:dropTarget={dropOptions}
  >
    <header class="browser-header">
      <div class="heading">
        <div class="title-row">
          <h2>Upload Destination</h2>
          <span class="hint">Click a breadcrumb to jump to that folder.</span>
        </div>
        <nav class="breadcrumb" aria-label="Folder path">
          {#each crumbSegments as segment, index (segment.id)}
            <button
              type="button"
              class:active={tree.currentFolderId === segment.id}
              onclick={() => changeFolder(segment.id, index)}
            >
              {segment.name}
            </button>
            {#if index < totalCrumbs - 1}
              <span class="crumb-divider" aria-hidden="true">
                <svg viewBox="0 0 8 12" role="img" focusable="false">
                  <path d="M2 1l4 5-4 5" />
                </svg>
              </span>
            {/if}
          {/each}
        </nav>
      </div>
      <div class="actions">
        <button
          type="button"
          class="secondary"
          onclick={handleManualRefresh}
          disabled={isBusy}
        >{isBusy ? 'Refreshing…' : 'Refresh'}</button>
        <button type="button" class="secondary" onclick={handleUploadClick}>Add Images</button>
        <button type="button" onclick={handleCreateFolder} disabled={isBusy}>New Folder</button>
      </div>
    </header>

    {#if bannerMessage}
      <div class="error">{bannerMessage}</div>
    {/if}

    {#if items.error}
      <div class="error subtle">{items.error}</div>
    {/if}

    <div class="grid" role="list">
      {#if items.sortedItems.length}
        {#each items.sortedItems as item (item.id)}
          <DriveItemCard item={item} on:open={(event) => openItem(event.detail)} />
        {/each}
      {:else}
        <div class="empty" role="note">This folder has no items yet.</div>
      {/if}
    </div>

    <footer class="drop-hint">
      <span>Drag files here, paste (Ctrl+V), or use “Add Images” to upload.</span>
    </footer>

    {#if items.isLoading}
      <div class="overlay">
        <div class="spinner" aria-label="Loading" role="status"></div>
      </div>
    {/if}

    {#if isDragActive}
      <div class="drag-overlay">Drop files here to upload</div>
    {/if}
  </section>
{/if}

<style>
  .drive-browser {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    position: relative;
    min-height: 420px;
  }

  .drive-browser.dragging {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  .browser-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid #f0f2f6;
    padding-bottom: 12px;
  }

  @media (min-width: 720px) {
    .browser-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
  }

  .heading {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .title-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title-row h2 {
    margin: 0;
    font-size: 1.32rem;
    color: #1f2937;
  }

  .title-row .hint {
    font-size: 0.86rem;
    color: #667085;
  }

  .breadcrumb {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 1.04rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.35);
    padding-bottom: 6px;
  }

  .breadcrumb button {
    position: relative;
    border: none;
    background: none;
    color: #1f2937;
    cursor: pointer;
    padding: 6px 0;
    font-weight: 600;
    transition: color 0.15s ease;
  }

  .breadcrumb button:hover {
    color: #2563eb;
  }

  .breadcrumb button.active {
    color: #1d4ed8;
  }

  .breadcrumb button.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -6px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #2563eb, #3b82f6);
  }

  .crumb-divider {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
  }

  .crumb-divider svg {
    width: 8px;
    height: 12px;
    stroke: rgba(148, 163, 184, 0.7);
    stroke-width: 1.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .actions button {
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid #3b82f6;
    background-color: #3b82f6;
    color: #fff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.12s ease, opacity 0.12s ease;
  }

  .actions button.secondary {
    background-color: transparent;
    color: #3b82f6;
  }

  .actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .actions button:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .error {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    padding: 10px 12px;
    border-radius: 8px;
  }

  .error.subtle {
    margin-top: -8px;
    background-color: rgba(255, 245, 245, 0.9);
    color: #b45309;
    border-color: #fed7aa;
  }

  .grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .empty {
    grid-column: 1 / -1;
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    color: #6b7280;
    border: 1px dashed #d1d5db;
    border-radius: 14px;
    background-color: #f9fafb;
    font-size: 0.95rem;
  }

  .drop-hint {
    font-size: 0.85rem;
    color: #4b5563;
    text-align: center;
    padding: 8px;
    border-top: 1px solid #f0f2f6;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(1px);
    border-radius: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid rgba(37, 99, 235, 0.2);
    border-top-color: #2563eb;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .drag-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
    font-weight: 600;
    pointer-events: none;
    border: 2px dashed rgba(59, 130, 246, 0.6);
  }
</style>
