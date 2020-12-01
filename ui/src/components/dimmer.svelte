<script lang="ts">
  import { fade } from 'svelte/transition'
</script>

<div class="dimmer-wrapper" transition:fade>
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
  }
</style>
