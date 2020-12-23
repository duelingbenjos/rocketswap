<script lang="ts">
  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import SwapButtons from './swap-buttons.svelte'
  import { swap_panel_store, token_metrics_store } from '../store'
  import type { MetricsUpdateType, SwapPanelType, TokenListType, TokenMetricsType } from '../types/api.types'
  import { WsService } from '../services/ws.service'
  import { onDestroy } from 'svelte'
  import { fly } from 'svelte/transition'

  let ws = WsService.getInstance()

  let selected_token: TokenListType
  let token_metrics: TokenMetricsType = {}
  let metric: MetricsUpdateType
  $: metric = token_metrics[selected_token?.contract_name]
  let trade_details: { currency_out: number; token_out: number; currency_slippage: number; token_slippage: number; contract_name: string; token_symbol: string }
  $: trade_details
  
  let swap_panel_unsub = swap_panel_store.subscribe((update) => {
    // console.log('quote panel update : ', update)
    if (update.slot_b.selected_token?.contract_name !== selected_token?.contract_name) {
      ws.leavePriceFeed(selected_token?.contract_name)
      selected_token = update.slot_b.selected_token
      ws.joinPriceFeed(update.slot_b.selected_token.contract_name)
    }
    getTradeDetails(token_metrics)
  })
  let token_metrics_unsub = token_metrics_store.subscribe((metrics) => getTradeDetails(metrics))

  function getTradeDetails(metrics) {
    if (!metrics) return
    // console.log(metrics)
    token_metrics = metrics
    if (Object.keys(token_metrics).length) {
      trade_details = {
        ...calcDetails(),
        contract_name: $swap_panel_store.slot_b.selected_token?.contract_name,
        token_symbol: $swap_panel_store.slot_b.selected_token?.token_symbol
      }
      // console.log(trade_details)
    }
  }

  function switchPositions() {
    const swap_panel = $swap_panel_store
    swap_panel.slot_a.position = swap_panel.slot_a.position === 'from' ? 'to' : 'from'
    swap_panel.slot_b.position = swap_panel.slot_a.position === 'from' ? 'to' : 'from'
    swap_panel_store.set(swap_panel)
  }

  function calcDetails() {
    let swap_panel = $swap_panel_store
    let currency_direction = swap_panel.slot_a.position === 'from' ? 'in' : 'out'
    let currency_amount = swap_panel.slot_a.input_amount
    let token_amount = swap_panel.slot_b.input_amount
    // console.log(currency_amount - token_amount)
    // console.log('currency_amount : ', currency_amount, 'token amount: ', token_amount)
    // let currency_out = currency_reserve - currency_reserve_new
    // let token_out = token_reserve - token_
    //     # def calculate_trade_details(tau_contract, token_contract, tau_in, token_in):
    // #     # First we need to get tau + token reserve
    // #     tau_reserve = pairs[tau_contract, token_contract, 'tau_reserve']
    // #     token_reserve = pairs[tau_contract, token_contract, 'token_reserve']
    // #
    // #     lp_total = tau_reserve * token_reserve
    let contract_name = selected_token?.contract_name
    if (!token_metrics[contract_name]) return
    let [currency_reserve, token_reserve] = token_metrics ? token_metrics[contract_name].reserves.map((reserve) => parseFloat(reserve)) : [0, 0]
    // console.log(typeof currency_reserve, token_reserve)
    let lp_total = currency_reserve * token_reserve
    // #
    // #     # Calculate new reserve based on what was passed in
    // #     tau_reserve_new = tau_reserve + tau_in if tau_in > 0 else 0
    // #     token_reserve_new = token_reserve + token_in if token_in > 0 else 0
    let currency_reserve_new = currency_reserve + (currency_direction === 'in' ? currency_amount : 0)
    let token_reserve_new = token_reserve + (currency_direction === 'in' ? 0 : token_amount)
    // #
    // #     # Calculate remaining reserve
    // #     tau_reserve_new = lp_total / token_reserve_new if token_in > 0 else tau_reserve_new
    // #     token_reserve_new = lp_total / tau_reserve_new if tau_in > 0 else token_reserve_new
    currency_reserve_new = currency_direction === 'out' ? lp_total / token_reserve_new : currency_reserve_new
    token_reserve_new = currency_direction === 'in' ? lp_total / currency_reserve_new : token_reserve_new
    // #
    // #     # Calculate how much will be removed
    // #     tau_out = tau_reserve - tau_reserve_new if token_in > 0 else 0
    // #     token_out = token_reserve - token_reserve_new if tau_in > 0  else 0
    let currency_out = currency_direction === 'out' ? currency_reserve - currency_reserve_new : 0
    let token_out = currency_direction === 'in' ? token_reserve - token_reserve_new : 0
    // #
    // #     # Finally, calculate the slippage incurred
    // #     tau_slippage = (tau_reserve / tau_reserve_new) -1 if token_in > 0 else 0
    // #     token_slippage = (token_reserve / token_reserve_new) -1 if tau_in > 0 else 0
    let currency_slippage = currency_direction === 'out' ? currency_reserve / currency_reserve_new - 1 : 0
    let token_slippage = currency_direction === 'in' ? token_reserve / currency_reserve_new - 1 : 0
    // #
    // #     return tau_out, token_out, tau_slippage, token_slippage
    return { currency_out, token_out, currency_slippage, token_slippage, currency_amount, token_amount }
  }

  onDestroy(() => {
    swap_panel_unsub()
    token_metrics_unsub()
    ws.leavePriceFeed(selected_token?.contract_name)
  })
</script>

<div class="wrapper">
  <div class="container">
    <Input {token_metrics} position="from" context="swap" />
    <div class="switch-symbols-cont"><button on:click={switchPositions}><img src="/assets/images/down-arrow.svg" alt="" /> </button></div>
    <Input {token_metrics} position="to" context="swap" />
    <Quote {selected_token} {token_metrics} />
    <SwapButtons />
  </div>
  {#if trade_details}
    <div class="slippage-display-container" in:fly={{ y: -30, duration: 300, delay: 400 }}>
      <div>token: {trade_details.token_symbol}</div>
      <div>currency slippage: {trade_details.currency_slippage}</div>
      <div>token_slippage: {trade_details.token_slippage}</div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    flex-grow: 1;
    padding-top: 15px;
    /* min-height: 100%; */
    /* display: flex; */
    /* justify-content: center; */
  }
  .slippage-display-container {
    margin: 0 auto;
    margin-top: 30px;
    height: 100px;
    background-color: #262652;
    color: white;
    width: 300px;
    padding: 15px;
    border-radius: 15px;
    margin-bottom: 40px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
  }
  .switch-symbols-cont {
    margin: 0 auto;
    margin-top: 10px;
    width: 100%;
    height: 40px;
    text-align: center;
  }

  .container {
    background-color: #875dd6;
    width: 444px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
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

  @media screen and (max-width: 800px) {
    .container {
      height: 100%;
      width: 100%;
      border-radius: 0px;
    }
  }
</style>
