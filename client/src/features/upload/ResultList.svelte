<script>
  import { results } from './results.js';
  import ResultItem from './ResultItem.svelte';
</script>

<ul class="results">
  {#each $results as result (result.id)}
    <ResultItem {result} />
  {/each}
</ul>

<style>
  .results {
    list-style: none;
    padding: 0;
  }
</style>