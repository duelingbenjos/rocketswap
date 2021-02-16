<script lang="ts">
  export let callback
  export let text
  export let margin
  export let disabled
  export let loading = false

  import Spinner from './pulse-spinner.svelte'
</script>


<style>
  .ignore-clicks {
    pointer-events: none;
  }
</style>

<div class="container">
  <button {disabled} class={`primary large full margin: ${margin}; ${loading ? 'ignore-clicks' : ''}`} on:click={callback}>
    {#if !loading}
      {text}
    {:else}
        <Spinner size={40} color="#FFFFFF" unit="px" margin="9px auto 10px"/>
    {/if}
  </button>
</div>

