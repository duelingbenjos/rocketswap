<script lang="ts">
  import Router from 'svelte-hash-router'
  import Header from './components/header.svelte'
  import Footer from './components/footer.svelte'
  import Dimmer from './components/dimmer.svelte'
  import ToastsContainer from './components/toasts-container.svelte'
  import TokenSelect from './components/token-select.svelte'
  import { onMount } from 'svelte'
  import { WalletService } from './services/wallet.service'
  import { ApiService } from './services/api.service'
  import { WsService } from './services/ws.service'
  import { show_token_select_store, show_swap_confirm } from './store'
  import type { TokenSelectType } from './types/api.types'
  import SwapConfirm from './components/swap-confirm.svelte'

  let show_token_select: TokenSelectType

  onMount(() => {
    /** Initialise Singleton Instances */
    WsService.getInstance()
    WalletService.getInstance()
    ApiService.getInstance()
    show_token_select_store.subscribe((update) => {
      show_token_select = update
    })
  })
</script>

<main>
  <div class="bg-solid">
    <div class="bg-gradient flex">
      {#if show_token_select?.open}
        <Dimmer>
          <TokenSelect content={show_token_select.content}/>
        </Dimmer>
      {/if}
      {#if $show_swap_confirm}
        <Dimmer>
          <SwapConfirm />
        </Dimmer>
      {/if}
      <Header />
      <Router />
      <ToastsContainer />

    </div>
  </div>
</main>
<Footer />

<style>
  .bg-gradient {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: linear-gradient(rgba(233, 43, 247, 0.3), rgba(0, 0, 0, 0));
  }

  .bg-solid {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #120e4a;
  }

  .flex {
    display: flex;
    flex-direction: column;
    /* justify-items: space-between; */
    /* justify-content: space-between; */
    align-items: center;
  }

  main {
    height: 100%;
    width: 100%;
  }
</style>
