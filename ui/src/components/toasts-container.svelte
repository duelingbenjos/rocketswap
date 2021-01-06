<script lang="ts">
  import type { ToastType, ToastMetaType } from '../types/toast.types'
  import { quintOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { ToastService } from '../services/toast.service'
  import type { token_metrics_store } from '../store'

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

<div style="position: absolute; top: 50px; right: 0px; width: 350px; padding: 10px 10px 0px 0px; z-index: 10">
  {#each toasts as t (t.id)}
    <div in:receive={{ key: t.id }} out:send={{ key: t.id }} animate:flip={{ duration: 700 }} class={`toast-container ${t.type}`}>
      <div class={`text-container`}>
        <div class="heading">{t.heading}</div>
        {#if t.text}
          <div class="subtext">{t.text}</div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .heading {
    font-weight: 600;
  }

  .toast-container {
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    background-color: rgba(255, 255, 255, 0.9);
    margin-top: 15px;
    border: 1px solid var(--box-border-color);
    min-height: 70px;
    width: 320px;
    background-color: #2a334a;
    border-radius: 8px;
    border: 3px solid var(--info-color);
    color: #fff;
    padding: 10px;
  }

  .warning {
    border: 3px solid var(--warning-color);
  }

  .error {
    border: 3px solid var(--error-color);
  }

  .info {
    border: 3px solid var(--info-color);
  }
</style>
