<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { config } from '../config'
  import type { SlotType, SwapPanelType } from '../store'
  import { show_token_select_store, swap_panel_store, wallet_store } from '../store'
  import type { WalletConnectedType } from '../types/wallet.types'
  export let position: 'from' | 'to'

  let selected: SlotType
  let balance, role, slot_position, selected_token, wallet

  $: wallet_balance = wallet.balance

  let swap_unsub = swap_panel_store.subscribe((update) => {
    const { slot_a, slot_b } = update
    selected = slot_a.position === position ? slot_a : slot_b
    balance = selected.selected_token?.balance
    role = selected.role
    slot_position = selected.position
    selected_token = selected.selected_token
  })

  let wallet_unsub = wallet_store.subscribe((update) => {
    wallet = update
  })

  onDestroy(() => {
    swap_unsub()
    wallet_unsub()
  })

  function openTokenSelect() {
    show_token_select_store.set(true)
  }

  // function getBalance(selected: SlotType) {
  //   console.log(selected)
  //   if (role === 'currency') {
  //     console.log('currency')
  //     console.log("WALLET" ,wallet)
  //     return (wallet as WalletConnectedType).balance
  //   }
  //   if (selected.selected_token) {
  //     return selected.selected_token.balance ? selected.selected_token.balance : 0
  //   }
  // }
</script>

<div class="container">
  <div class="amount">
    <div class="label">{position === 'from' ? 'From' : 'To'}</div>
    <div class="amount-value number"><input /></div>
  </div>
  <div class="token-info">
    {#if role === 'currency'}
      <div class="label">{wallet_balance ? `Balance: ` : ''}<span class="number">{wallet_balance ? `${wallet_balance}` : ''}</span></div>
    {:else}
      <div class="label">{selected_token ? `Balance: ` : ''}<span class="number">{selected_token ? `${selected_token.balance}` : ''}</span></div>
    {/if}
    <div class="token-controls">
      <div class="max-button-cont">
        {#if position === 'from'}<button class="max-button">MAX</button>{/if}
      </div>
      <div class="token-button-cont">
        {#if role === 'token'}
          {#if selected.selected_token}
            <button class="token-select-button" on:click={openTokenSelect}>{selected.selected_token.token_symbol.toUpperCase()}
              <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /></button>
          {:else}
            <button on:click={openTokenSelect} class="no-token-button"> Select Token <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /> </button>
          {/if}
        {:else}
          <button style="pointer-events: none" class="token-select-button" on:click={openTokenSelect}>{config.currencySymbol}
            <img style="opacity: 0" src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /></button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .no-token-button {
    background-color: #3131d98f;
    font-size: 1.2em;
    color: #fff;
    padding: 7px;
    border-radius: 15px;
    height: 40px;
    width: 155px;
  }
  .amount-value {
    width: 250px;
  }

  .amount-value > input {
    font-size: 40px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0);
    border: none;
    padding: 0px;
  }

  .max-button-cont {
    margin-right: 20px;
  }

  .token-select-button {
    color: #fff;
    font-size: 30px;
    /* width: 110px; */
  }

  .max-button {
    background-color: #3131d98f;
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    height: 30px;
    width: 60px;
    border-radius: 15px;
  }

  .container {
    width: 90%;
    margin-top: 30px;
    padding: 10px;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    height: 120px;
    justify-content: space-between;
    margin: 0 auto;
  }

  .amount {
    padding: 5px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .token-info {
    padding: 5px 15px 0px 0px;
    display: flex;
    width: 230px;
    flex-direction: column;
    justify-content: space-between;
    justify-items: end;
    text-align: right;
  }

  .token-controls {
    display: flex;
    justify-content: space-between;
    /* align-items: end; */
    /* width: 200px; */
  }

  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 22px;
  }

  .amount-value {
    font-size: 40px;
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
