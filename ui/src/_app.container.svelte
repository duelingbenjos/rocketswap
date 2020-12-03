<script lang="ts">
  import Header from './components/header.svelte'
  import SwapPanel from './components/swap-panel.svelte'
  import Footer from './components/footer.svelte'
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

<main>
  <div class="bg-solid">
    <div class="bg-gradient flex">
      <Header />
      <SwapPanel />
      <Footer />
    </div>
  </div>
  {#if show_token_select}
    <Dimmer>
      <TokenSelect />
    </Dimmer>
  {/if}
</main>

<style>
  main {
    height: 100%;
    width: 100%;
  }

  .bg-gradient {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: linear-gradient(rgba(233, 43, 247, 0.6), rgba(0, 0, 0, 0));
  }

  .bg-solid {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #120E4A;
  }

  .flex {
    display: flex;
    flex-direction: column;
    justify-items: space-between;
    justify-content: space-between;
    align-items: center;
  }
</style>
