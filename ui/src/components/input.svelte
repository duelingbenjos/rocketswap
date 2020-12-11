<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { config } from '../config'
  import { isWalletConnected } from '../services/wallet.service'
  import { pool_panel_store, token_metrics_store } from '../store'
  import type { SlotType, SwapPanelType, TokenMetricsType } from '../types/api.types'
  import { show_token_select_store, swap_panel_store, wallet_store } from '../store'
  import TokenSelect from './token-select.svelte'
  import type { Writable } from 'svelte/store'

  export let position: 'from' | 'to'
  export let label
  export let context: 'pool' | 'swap'
  export let token_metrics: TokenMetricsType

  let selected: SlotType
  $: selected
  $: selected_token
  let balance, role, slot_position, selected_token, wallet, input_amount
  let context_store: Writable<SwapPanelType>

  $: wallet_balance = parseFloat(wallet.balance)
  $: balance
  $: input_amount

  let input_unsub

  onMount(() => {
    if (context === 'swap') {
      context_store = swap_panel_store
    } else if (context === 'pool') {
      context_store = pool_panel_store
    }
    input_unsub = context_store.subscribe((update) => handleInputStoreUpdate(update))
  })

  let wallet_unsub = wallet_store.subscribe((update) => {
    wallet = update
    if (selected_token && wallet.tokens) {
      balance = wallet.tokens.balances[selected_token.contract_name]
    }
  })

  onDestroy(() => {
    input_unsub()
    wallet_unsub()
  })

  function handleInputStoreUpdate(update) {
    selected = getPosition(update)
    balance = selected.selected_token?.balance
    role = selected.role
    slot_position = selected.position
    selected_token = selected.selected_token
    input_amount = selected.input_amount
  }

  function getPosition(update: SwapPanelType) {
    const { slot_a, slot_b } = update
    return slot_a.position === position ? slot_a : slot_b
  }

  function openTokenSelect() {
    show_token_select_store.set({ open: true, context })
  }

  function handleInputChange(e) {
    let active_input
    let other_input
    context_store.update((current_value) => {
      // console.log(role)

      active_input = current_value.slot_a.role === role ? current_value.slot_a : current_value.slot_b
      other_input = current_value.slot_a.role !== role ? current_value.slot_a : current_value.slot_b
      const contract_name = role === 'currency' ? other_input.selected_token.contract_name : active_input.selected_token.contract_name
      const update_amount = getUpdateAmount(e.target.value, role, position)
      active_input.input_amount = update_amount
      other_input.input_amount =
        role === 'token'
          ? parseFloat((update_amount * $token_metrics_store[contract_name].price).toFixed(6))
          : parseFloat((update_amount * $token_metrics_store[contract_name].price).toFixed(6))
      // console.log(typeof update_amount)
      return current_value
    })
  }

  function getUpdateAmount(value: string, role: string, position: 'to' | 'from'): number {
    let parsed_value = parseFloat(value)
    let amount
    let max_amount = role === 'currency' ? wallet_balance : selected_token.balance
    if (position === 'from') {
      amount = parsed_value > max_amount ? max_amount : parsed_value
    } else {
      amount = parsed_value
    }
    // if (parsed_value === NaN) parsed_value = 0
    return parseFloat(amount.toFixed(6))
  }

  function handleMaxInput() {
    const slots = $context_store
    let selected_token = slots.slot_b.selected_token
    const metrics = token_metrics[selected_token?.contract_name]
    if (role === 'currency') {
      slots.slot_a.input_amount = parseFloat(wallet_balance.toFixed(6)) || 0
      // console.log(slots.slot_a.input_amount)
      if (metrics) slots.slot_b.input_amount = parseFloat((wallet_balance / metrics.price).toFixed(6))
    } else if (role === 'token') {
      slots.slot_b.input_amount = parseFloat(selected_token.balance.toFixed(6)) || 0
      if (metrics) slots.slot_a.input_amount = parseFloat((selected_token.balance * metrics.price).toFixed(6))
    }

    context_store.set(slots)
  }
</script>

<div class="container">
  <div class="amount">
    <div class="label">{label ? label : position === 'from' ? 'From' : 'To'}</div>
    <div class="amount-value number"><input placeholder="0.0" bind:value={input_amount} type="number" on:input={handleInputChange} /></div>
  </div>
  <div class="token-info">
    {#if role === 'currency'}
      <div class="label">{wallet_balance ? `Balance: ` : ''}<span class="number">{wallet_balance ? `${wallet_balance?.toFixed(2)}` : '0.00'}</span></div>
    {:else}
      <div class="label">{selected_token && wallet_balance ? `Balance: ` : ''}<span class="number">{selected_token ? `${balance?.toFixed(2) || "0.00"}` : ''}</span></div>
    {/if}
    <div class="token-controls">
      <div class="max-button-cont">
        {#if position === 'from' && isWalletConnected(wallet) && (role === 'token' ? selected_token : true)}<button on:click={handleMaxInput} class="max-button">MAX</button>{/if}
      </div>
      <div class="token-button-cont">
        {#if role === 'token'}
          {#if selected.selected_token}
            <button class="token-select-button" on:click={openTokenSelect}>{selected.selected_token.token_symbol.toUpperCase()}
              <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /></button>
          {:else}
            <button on:click={() => openTokenSelect()} class="no-token-button">Select Token
              <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" />
            </button>
          {/if}
        {:else}
          <button style="pointer-events: none" class="token-select-button" on:click={openTokenSelect}>{config.currencySymbol}
            <img style="opacity: 0" src="assets/images/chevron-arrow-down.svg" height="16px" width="16px" alt="" /></button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .no-token-button {
    background-color: #3131d98f;
    display: flex;
    font-size: 0.8em;
    font-weight: 600;
    color: #fff;
    padding: 7px 10px;
    border-radius: 10px;
    justify-content: space-between;
    align-items: center;
    /* height: 32px; */
    width: 124px;
  }

  .no-token-button > img {
    height: 12px;
  }

  .amount-value {
    width: 210px;
  }

  .amount-value > input {
    font-size: 0.9em;
    color: #fff;
    background-color: rgba(0, 0, 0, 0);
    border: none;
    padding: 0px;
  }

  .max-button-cont {
    margin-right: 10px;
    padding-top: 5px;
    font-size: 0.8em;
    font-weight: 600;
  }

  .token-select-button {
    color: #fff;
    font-size: 1.7em;
    font-weight: 600;
    /* width: 110px; */
  }

  .max-button {
    background-color: #3131d98f;
    color: #fff;
    font-size: 1.1em;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 15px 0px;
    height: 24px;
    width: 60px;
    border-radius: 18px;
    text-align: center;
  }

  .container {
    width: 89%;
    margin-top: 30px;
    padding: 10px;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    height: 100px;
    justify-content: space-between;
    margin: 0 auto;
  }

  .amount {
    padding: 5px 0px 0px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .token-info {
    /* padding: 5px 15px 0px 0px; */
    display: flex;
    width: 185px;
    flex-direction: column;
    justify-content: space-between;
    justify-items: end;
    text-align: right;
    padding-right: 10px;
  }

  .token-controls {
    display: flex;
    justify-content: flex-end;
    /* align-items: start; */
    /* width: 200px; */
  }

  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1em;
    padding: 2px 10px 0px 0px;
  }

  .amount-value {
    font-size: 32px;
    color: #fff;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
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
