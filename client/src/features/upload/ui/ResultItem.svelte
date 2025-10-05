<script lang="ts">
  import type { UploadResult } from '../state/uploadResults.svelte.ts';

  export let result: UploadResult;

  function formatSize(bytes?: number) {
    if (!bytes && bytes !== 0) return '—';
    return Math.round(bytes / 1024);
  }
</script>

<li>
  <div>
    {result.originalName}
    {#if result.status === 'processing'}
      <span class="processing">Processing...</span>
    {:else if result.status === 'completed'}
      ({formatSize(result.originalSize)}KB → {formatSize(result.optimizedSize)}KB)
    {:else if result.status === 'error'}
      <span class="error">Error occurred</span>
    {/if}
  </div>
  {#if result.status === 'completed'}
    <div class="actions">
      <a href={result.optimizedUrl} download={result.filename} class="download-btn">
        Download
      </a>
      {#if result.driveLink}
        <a href={result.driveLink} target="_blank" class="drive-btn">
          View in Drive
        </a>
      {/if}
    </div>
  {/if}
</li>

<style>
  li {
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .processing {
    color: #666;
    font-style: italic;
  }

  .error {
    color: #dc3545;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .download-btn {
    background-color: #007bff;
    color: white;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 4px;
  }

  .drive-btn {
    background-color: #0F9D58;
    color: white;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 4px;
  }
</style>
