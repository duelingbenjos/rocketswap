<script lang="ts">
  export let showSwitch
  export let selected_token : TokenListType
  export let token_metrics : TokenMetricsType

  import { onDestroy, onMount } from 'svelte'
  import { config } from '../config'
  import { WsService } from '../services/ws.service'
  import { swap_panel_store, token_metrics_store } from '../store'
  import type { TokenListType, TokenMetricsType } from '../types/api.types'

  $: symbol = selected_token?.token_symbol

</script>

<div class="container">
  {#if selected_token && token_metrics[selected_token?.contract_name]?.price}
    <div class="label">Last Price :</div>
    <div class="quote-container">
      <div class="quote-text label">
        {token_metrics[selected_token?.contract_name].price.toFixed(6)}
        <b>{symbol} / {config.currencySymbol}</b>
        {#if showSwitch}
          <div><button> <img src="assets/images/switch.svg" alt="" /> </button></div>
        {/if}
      </div>
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
