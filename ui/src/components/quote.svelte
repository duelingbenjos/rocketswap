<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { config } from '../config'
  import { WsService } from '../services/ws.service'
  import { swap_panel_store, token_metrics_store } from '../store'
  import type { TokenListType, TokenMetricsType } from '../types/api.types'

  const ws = WsService.getInstance()
  let swap_panel_unsub
  let token_metrics_unsub

  let selected_token: TokenListType
  $: symbol = selected_token?.token_symbol
  let token_metrics: TokenMetricsType

  onMount(() => {
    token_metrics_unsub = token_metrics_store.subscribe((metrics) => {
      console.log(metrics)
      token_metrics = metrics
    })
    swap_panel_unsub = swap_panel_store.subscribe((update) => {
      console.log('quote panel update : ', update)
      if (update.slot_b.selected_token) {
        ws.leavePriceFeed(selected_token?.contract_name)
        selected_token = update.slot_b.selected_token
        ws.joinPriceFeed(update.slot_b.selected_token.contract_name)
      }
    })
  })

  onDestroy(() => {
    swap_panel_unsub()
    token_metrics_unsub()
    ws.leavePriceFeed(selected_token.contract_name)
  })
</script>

<div class="container">
  {#if selected_token && token_metrics[selected_token?.contract_name]}
    <div class="label">Last Price :</div>
    <div class="quote-container">
      <div class="quote-text label">{token_metrics[selected_token?.contract_name].price.toFixed(8)} <b>{symbol} / {config.currencySymbol}</b></div>
    </div>
  {/if}
</div>

<style>
  .container {
    color: #ffffffaf;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 32px;
    height: 50px;
  }

  .quote-container {
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: center;
  }

  .quote-text {
    margin-right: 10px;
  }

  .quote-container button {
    height: 20px;
  }

  .quote-container button img {
    height: 30px;
  }

  .label {
    line-height: 30px;
    color: #fff;
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
</style>
