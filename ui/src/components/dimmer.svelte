<script lang="ts">
  import { fade } from 'svelte/transition'
  import { show_swap_confirm, show_token_select_store } from '../store'

  function closeModals() {
    show_token_select_store.set({ open: false })
    show_swap_confirm.set(false)
  }
</script>

<div class="dimmer-wrapper" transition:fade={{ duration: 300 }}>
  <slot />
</div>

<style>
  .dimmer-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
</style>
