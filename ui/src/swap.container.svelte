<script lang="ts">
  import SwapPanel from './components/swap-panel.svelte'
  import { WalletService } from './services/wallet.service'
  import { ApiService } from './api.service'
  import { onMount } from 'svelte'
  import Dimmer from './components/dimmer.svelte'
  import TokenSelect from './components/token-select.svelte'
  import { show_token_select_store } from './store'

  let show_token_select: boolean

  onMount(() => {
    WalletService.getInstance()
    ApiService.getInstance()
    show_token_select_store.subscribe((update) => {
      show_token_select = update
    })
  })
</script>

<SwapPanel />
{#if show_token_select}
  <Dimmer>
    <TokenSelect />
  </Dimmer>
{/if}
