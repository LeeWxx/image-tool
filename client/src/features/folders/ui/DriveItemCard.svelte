<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { DriveItem } from '../types.ts';
  import { isDriveFolder } from '../index.ts';

  const props = $props<{ item: DriveItem }>();
  const item = $derived(props.item);

  const dispatch = createEventDispatcher<{ open: DriveItem }>();

  const isFolder = $derived(isDriveFolder(item));
  const isImage = $derived(!isFolder && !!item.mimeType && item.mimeType.startsWith('image/'));
  const previewUrl = $derived(resolvePreviewUrl(item));
  const showImagePreview = $derived(Boolean(previewUrl && isImage));
  const modifiedLabel = $derived(formatModifiedTime(item.modifiedTime));
  const sizeLabel = $derived(formatSize(item.size));

  function handleOpen() {
    dispatch('open', item);
  }

  function resolvePreviewUrl(file: DriveItem) {
    if (isFolder) {
      return '';
    }
    if (file.thumbnailLink) {
      return file.thumbnailLink;
    }
    if (file.iconLink) {
      return file.iconLink;
    }
    return '';
  }

  function formatModifiedTime(value?: string) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatSize(value?: string) {
    if (!value || isFolder) {
      return '';
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return '';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let size = numeric;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }
</script>

<button
  type="button"
  class="item-card"
  class:folder={isFolder}
  class:image={isImage}
  onclick={handleOpen}
>
  <div class="preview" class:folder={isFolder} class:image={showImagePreview}>
    {#if isFolder}
      <span class="folder-icon" aria-hidden="true">📁</span>
    {:else if showImagePreview}
      <img src={previewUrl} alt={item.name} loading="lazy" decoding="async" />
    {:else}
      <span class="icon" aria-hidden="true">📄</span>
    {/if}
  </div>
  <div class="details">
    <span class="name" title={item.name}>{item.name}</span>
    <span class="meta">
      {#if isFolder}
        <span>Folder</span>
      {:else if sizeLabel}
        <span>{sizeLabel}</span>
      {/if}
      {#if modifiedLabel}
        <span>· {modifiedLabel}</span>
      {/if}
    </span>
  </div>
</button>

<style>
  .item-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border: 1px solid #d4d8e1;
    border-radius: 14px;
    background-color: #fff;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
    text-align: left;
  }

  .item-card:hover {
    border-color: #4c7dff;
    box-shadow: 0 6px 18px rgba(76, 125, 255, 0.18);
    transform: translateY(-2px);
  }

  .preview {
    position: relative;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: none;
  }

  .preview:not(.folder):not(.image) {
    background-color: #f4f6fb;
  }

  .preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon {
    font-size: 2.4rem;
  }

  .folder-icon {
    font-size: clamp(3rem, 10vw, 4.6rem);
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name {
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    display: flex;
    gap: 6px;
    font-size: 0.8rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
