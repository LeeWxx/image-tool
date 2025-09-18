<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { isImageFile, getImageFromClipboard } from './lib.js';

  const dispatch = createEventDispatcher();
  let dropArea;
  let isDragging = false;

  onMount(() => {
    setupEventListeners();
  });

  function setupEventListeners() {
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea?.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    dropArea?.addEventListener('dragenter', handleDragEnter);
    dropArea?.addEventListener('dragleave', handleDragLeave);
    dropArea?.addEventListener('drop', handleDrop);

    // Paste event
    document.addEventListener('paste', handlePaste);
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter() {
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e) {
    isDragging = false;
    const files = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (files.length > 0) {
      dispatch('files', files);
    }
  }

  function handlePaste(e) {
    const image = getImageFromClipboard(e.clipboardData.items);
    if (image) {
      dispatch('files', [image]);
    }
  }

  function handleClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files).filter(isImageFile);
      if (files.length > 0) {
        dispatch('files', files);
      }
    };
    input.click();
  }
</script>

<p class="hint">Drag & drop images or paste from clipboard (Ctrl+V)</p>
<div
  bind:this={dropArea}
  class="drop-area"
  class:drag-over={isDragging}
  on:click={handleClick}
>
  Drop images here
</div>

<style>
  .hint {
    text-align: center;
    color: #666;
    margin-bottom: 20px;
    font-size: 0.9em;
  }

  .drop-area {
    width: 100%;
    height: 200px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background-color: #f9f9f9;
    transition: all 0.3s;
    cursor: pointer;
  }

  .drop-area:hover,
  .drop-area.drag-over {
    border-color: #007bff;
    background-color: #f0f8ff;
  }
</style>