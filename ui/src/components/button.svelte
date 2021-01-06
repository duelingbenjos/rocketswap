<script lang="ts">
  export let callback
  export let text
  export let margin;
  export let disabled: boolean
  export let loading: boolean = false

  import Spinner from './pulse-spinner.svelte'
</script>

<div class="container">
  <button {disabled} class={`primary large full margin: ${margin}; ${loading ? 'ignore-clicks' : ''}`} on:click={callback}>
    {#if !loading}
      {text}
    {:else}
        <Spinner size={50} color="#FFFFFF" unit="px" />
    {/if}
  </button>
</div>

<style>
  .ignore-clicks {
    pointer-events: none;
  }
</style>
