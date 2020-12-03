<script lang="ts">
  import { beforeUpdate, onDestroy, onMount } from 'svelte'
  import { config } from '../config'
import { isWalletConnected } from '../services/wallet.service';
  import type { SlotType, SwapPanelType } from '../store'
  import { show_token_select_store, swap_panel_store, wallet_store } from '../store'
  import type { WalletConnectedType } from '../types/wallet.types'
  export let position: 'from' | 'to'

  let selected: SlotType
  let balance, role, slot_position, selected_token, wallet, input_amount

  $: wallet_balance = wallet.balance

  let swap_unsub = swap_panel_store.subscribe((update) => {
    selected = getPosition(update)

    balance = selected.selected_token?.balance
    role = selected.role
    slot_position = selected.position
    selected_token = selected.selected_token
    input_amount = selected.input_amount
  })

  let wallet_unsub = wallet_store.subscribe((update) => {
    wallet = update
  })

  onDestroy(() => {
    swap_unsub()
    wallet_unsub()
  })


  function getPosition(update: SwapPanelType) {
    const { slot_a, slot_b } = update
    return slot_a.position === position ? slot_a : slot_b
  }

  function openTokenSelect() {
    show_token_select_store.set(true)
  }

  function handleInputChange(e) {
    console.log(e.target.value)
  }

  function handleMaxInput() {
    const slots = $swap_panel_store
    if (role === 'currency') {
      slots.slot_a.input_amount = wallet_balance || 0
    } else if (role === 'token') {
      slots.slot_a.input_amount = selected_token.balance || 0
    }
    swap_panel_store.set(slots)
  }
</script>

<div class="container">
  <div class="amount">
    <div class="label">{position === 'from' ? 'From' : 'To'}</div>
    <div class="amount-value number"><input placeholder="0.0" value={input_amount} on:input={handleInputChange} /></div>
  </div>
  <div class="token-info">
    {#if role === 'currency'}
      <div class="label">{wallet_balance ? `Balance: ` : ''}<span class="number">{wallet_balance ? `${wallet_balance || 0}` : ''}</span></div>
    {:else}
      <div class="label">{selected_token ? `Balance: ` : ''}<span class="number">{selected_token ? `${selected_token.balance || 0}` : ''}</span></div>
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
            <button on:click={openTokenSelect} class="no-token-button">Select Token <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /> </button>
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
    font-size: .8em;
    font-weight: 600;
    color: #fff;
    padding: 7px 10px;
    border-radius: 10px;
    justify-content: space-between;
    align-items: center;
    /* height: 32px; */
    width: 124px;
  }

  .no-token-button>img {
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
    font-size: .8em;
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
    justify-content:flex-end;
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
