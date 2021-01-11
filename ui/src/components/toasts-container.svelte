<script lang="ts">
  import type { ToastType, ToastMetaType } from '../types/toast.types'
  import { quintOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { ToastService } from '../services/toast.service'
  import type { token_metrics_store } from '../store'

  //Icons
  import CloseIcon from '../icons/close.svelte'

  const toastService = ToastService.getInstance()

  let toasts: ToastMetaType[]
  $: toasts
  toastService.toast_store.subscribe((toasts_array) => {
    toasts = toasts_array
  })

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node)
      const transform = style.transform === 'none' ? '' : style.transform

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
                      transform: ${transform} scale(${t});
                      opacity: ${t}
                  `
      }
    }
  })

  function handleRemove(id: number) {
    toastService.dismiss(id)
  }
</script>

<div class="toasts-container">
  {#each toasts as t (t.id)}
    <div in:receive={{ key: t.id }} out:send={{ key: t.id }} animate:flip={{ duration: 700 }} class={`toast-container ${t.type}`}>

      <div class={`text-container`}>
        <div class="heading flex-row flex-align-center">{t.heading}
          <div class="close" on:click={handleRemove(t.id)}> 
            <CloseIcon width="8px" />
          </div>
        </div>
        {#if t.text}
          <div class="subtext text-small">{t.text}</div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .toasts-container{
    position: absolute; 
    box-sizing: border-box;
    top: 50px; 
    right: 0px; 
    width: 280px; 
    padding: 10px 10px 0px 0px; 
    z-index: 105 
  }

  .text-container{
    width: 100%;
  }

  .heading {
    font-weight: 600;
    width: 100%;
    justify-content: space-between;
  }

  .close{
    position: relative;
    top: -8px;
    right: 0;
  }

  .subtext{
    line-height: 1.2;
    word-break: break-word;
  }

  .toast-container {
    justify-content: space-between;
    display: flex;
    flex-direction: row;

    margin-top: 15px;
    padding: 10px 10px 5px 10px;
    z-index: 110;

    border-radius: 8px 16px 8px 8px;
    background-color: var(--toast-background);

    min-height: 70px;
  }

  .success {
    border: 3px solid var(--success-color);
  }

  .warning {
    border: 3px solid var(--warning-color);
  }

  .error {
    border: 3px solid var(--error-color);
    background: var(--toast-background-error);
  }

  .info {
    border: 3px solid var(--info-color);
  }
</style>
