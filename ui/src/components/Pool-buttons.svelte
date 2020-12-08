
<script lang="ts">
  import { onMount } from 'svelte'
  import { pool_panel_store, wallet_store } from '../store'
  import { WalletService } from '../services/wallet.service'

  export let buttonFunction;

  let walletService;
  let disabled = true;

  onMount(() => {
    walletService = WalletService.getInstance()
  })

  const createMarket = () => {
    walletService.createMarket({
      'contract': $pool_panel_store.slot_b.selected_token.contract_name,
      'currency_amount': {'__fixed__': $pool_panel_store.slot_a.input_amount},
      'token_amount': {'__fixed__': $pool_panel_store.slot_b.input_amount}
    })
  }

  pool_panel_store.subscribe(update => {
    if (!$pool_panel_store.slot_b.selected_token) return
    let valid = true
    if (!$pool_panel_store.slot_a.input_amount || !$pool_panel_store.slot_b.input_amount) {
      console.log('fill out all inputs')
      valid = false
    }
    if ($wallet_store.balance.lt($pool_panel_store.slot_a.input_amount)) {
      console.log('not enough dTAU')
      valid = false
    }
    if ($pool_panel_store.slot_b.input_amount > $pool_panel_store.slot_b.selected_token.balance) {
      console.log('not enough Tokens')
      valid = false
    }
    disabled = !valid
  })

</script>

<div class="container">
  {#if buttonFunction === 'create'}
    <button class="swap-button" disabled={disabled} on:click={createMarket}> Create Market </button>
  {/if}
</div>

<style>
  .swap-button {
    width: 100%;
    background-color: #1d2fba;
    color: #fff;
    height: 56px;
    border-radius: 24px;
    font-size: 1.6em;
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  .container {
      padding: 10px 20px 10px 20px;
  }

  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
  button:disabled{
    filter: saturate(40%);
    color: rgb(230, 230, 230);
  }

</style>
