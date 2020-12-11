<script lang="ts">
  import { show_swap_confirm, swap_confirm_loading, swap_panel_store, token_metrics_store, wallet_store } from '../store'
  import { scale } from 'svelte/transition'
  import Button from './button.svelte'
  import type { SlotType } from '../types/api.types'
  import { config } from '../config'
  import { WalletService } from '../services/wallet.service'
  import type { WalletConnectedType } from '../types/wallet.types'

  const walletService = WalletService.getInstance()

  let swap_store = $swap_panel_store
  let from: SlotType, to: SlotType
  $: from = swap_store.slot_a.position === 'from' ? swap_store.slot_a : swap_store.slot_b
  $: to = swap_store.slot_a.position === 'to' ? swap_store.slot_a : swap_store.slot_b
  let token_metrics = $token_metrics_store

  function closeModal() {
    show_swap_confirm.set(false)
  }

  const makeTrade = () => {
    let action = swap_store.slot_a.position === 'from' ? 'buy' : 'sell'
    let contract_name = swap_store.slot_a.selected_token ? swap_store.slot_a.selected_token.contract_name : swap_store.slot_b.selected_token.contract_name
    let amount = from.input_amount
    if (action === 'buy') {
      walletService.buy(($wallet_store as WalletConnectedType).wallets[0], amount, contract_name)
    } else if (action === 'sell') {
      walletService.sell(($wallet_store as WalletConnectedType).wallets[0], {
        contract: contract_name,
        token_amount: amount
      })
    }
  }
</script>

<div class="swap-confirm-wrapper" transition:scale={{ duration: 300 }}>
  <div class="heading">
    <div class="big-text">Confirm Swap</div>
    <button class="nostyle" on:click={closeModal}> <img src="assets/images/cancel.svg" alt="" /></button>
  </div>
  <div class="amount">
    <div>{from.input_amount}</div>
    <div>{from.role === 'currency' ? config.currencySymbol : from.selected_token.token_symbol}</div>
  </div>
  <div class="icon-container"><img src="assets/images/down-arrow.svg" alt="" /></div>
  <div class="amount">
    <div>{to.input_amount} *</div>
    <div>{to.role === 'currency' ? config.currencySymbol : to.selected_token.token_symbol}</div>
  </div>
  <div class="disclaimer">* Output is estimated.</div>
  <div class="metric-container">
    <div class="label">Price</div>
    <div class="value">241231 RKT / TAU</div>
  </div>
  <div class="metric-container">
    <div class="label">Price Impact</div>
    <div class="value">2.4%</div>
  </div>
  <div class="metric-container">
    <div class="label">Liquidity Provider Fee</div>
    <div class="value">0.314 TAU</div>
  </div>
  <div class="button-wrapper">
    <Button style="secondary" loading={$swap_confirm_loading} callback={makeTrade} text="Confirm Swap" />
  </div>
</div>

<style>
  .button-wrapper {
    padding-top: 25px;
  }

  .value {
    font-weight: 600;
  }

  .metric-container {
    font-size: 1em;
    display: flex;
    justify-content: space-between;
  }

  .disclaimer {
    font-style: italic;
    font-size: 1em;
    padding-bottom: 40px;
  }

  .icon-container {
    width: 40px;
    text-align: center;
  }

  .amount {
    font-size: 2em;
    font-weight: 600;
    padding-top: 10px;
    width: 100%;
    display: flex;
    direction: row;
    justify-content: space-between;
    padding-bottom: 15px;
  }

  .heading {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding-bottom: 30px;
  }

  .big-text {
    font-size: 2em;
  }

  .swap-confirm-wrapper {
    /* pointer-events: none; */
    box-sizing: border-box;
    padding: 25px;
    /* height: 600px; */
    width: 450px;
    border-radius: 30px;
    background-color: #312a43;
    display: flex;
    flex-direction: column;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    color: #d9d9d9;
    z-index: 2;
  }
</style>
