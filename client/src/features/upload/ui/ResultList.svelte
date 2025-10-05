<script lang="ts">
  import { useUploadResults } from '../state/uploadResults.svelte.ts';
  import ResultItem from './ResultItem.svelte';

  const uploads = useUploadResults();
</script>

<ul class="results">
  {#each uploads.items as result (result.id)}
    <ResultItem {result} />
  {/each}
</ul>

<style>
  .results {
    list-style: none;
    padding: 0;
  }
</style>
