<script lang="ts">
  export let callback
  export let text
  export let style: 'primary' | 'secondary' | 'outline'
  export let disabled: boolean
  export let loading: boolean = false

  import Spinner from './pulse-spinner.svelte'
</script>

<div class="container">
  <button {disabled} class={`${style} ${loading ? 'ignore-clicks' : ''}`} on:click={callback}>
    {#if !loading}
      {text}
    {:else}
        <Spinner size={50} color="#FFFFFF" unit="px" />
    {/if}
  </button>
</div>

<style>
  /* let bg_color = style ==='primary' ? '#5744D8' : style === 'outline' ? 'rgba(255,255,255,0' */
  .primary {
    background-color: #5744d8;
  }
  .secondary {
    background-color: #2fba95;
  }

  .ignore-clicks {
    pointer-events: none;
  }

  .ouline {
    border: 3px solid #2fba95;
    background-color: none;
  }
  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
    z-index: 0;
    width: 100%;
    background-color: #3131d98f;
    color: #fff;
    height: 3em;
    border-radius: 24px;
    font-size: 1.6em;
    font-weight: 600;
    letter-spacing: 0.1em;
    box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
    -moz-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items:center;
    justify-content: center;
  }

  button:disabled {
    opacity: 0.7;
  }
</style>
