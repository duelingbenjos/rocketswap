<script lang="ts">
  import type { TokenListType } from '../types/api.types'
  import type { WalletConnectedType, WalletType } from '../types/wallet.types'
  import { onDestroy, onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { show_token_select_store, swap_panel_store, token_list_store, wallet_store } from '../store'
  import { isWalletConnected } from '../services/wallet.service'

  let token_list_unsub
  let wallet_unsub
  let selected_contract
  let swap_panel_unsub = swap_panel_store.subscribe((update) => (selected_contract = update.slot_b.selected_token?.contract_name))
  let wallet: WalletType
  let token_list: TokenListType[] = []

  onMount(() => {
    wallet_unsub = wallet_store.subscribe((update) => {
      wallet = update
    })
    token_list_unsub = token_list_store.subscribe((update) => {
      if (wallet && isWalletConnected(wallet)) {
        const list_with_balances = update
          .map((token) => {
            token.balance = (wallet as WalletConnectedType).tokens[token.contract_name] || 0
            return token
          })
          .sort((a, b) => {
            return a.token_symbol.toLowerCase() < b.token_symbol.toLowerCase() ? -1 : a.token_symbol.toLowerCase() > b.token_symbol.toLowerCase() ? 1 : 0
          })
          .sort((a, b) => a.balance - b.balance)
        token_list = [
          // { token_name: 'TAU', id: 'TAU', token_symbol: 'TAU', contract_name: 'currency', base_supply: 288090567 },
          ...list_with_balances
        ]
        console.log(token_list)
      } else {
        token_list = update
      }
    })
  })

  onDestroy(() => {
    token_list_unsub()
    wallet_unsub()
  })

  function closeModal() {
    show_token_select_store.set(false)
  }

  function selectToken(token: TokenListType) {
    const swap_panel = $swap_panel_store
    swap_panel.slot_b.selected_token = token
    swap_panel_store.set(swap_panel)
    setTimeout(() => {
      closeModal()
    }, 150)
  }
</script>

<div class="token-select-wrapper" transition:fly={{ y: 50, duration: 300 }}>
  <div class="heading"><span> Select a token </span> <button class="nostyle" on:click={closeModal}> <img src="assets/images/cancel.svg" alt="" /></button></div>

  <div class="select-heading">Token Name</div>
  <hr />
  <div class="token-scroll">
    <div class="token-list">
      {#each token_list as token}
        <button on:click={() => selectToken(token)} class="nostyle button-item">
          <div class="select-icon">
            {#if token.contract_name === selected_contract}<img src="assets/images/token-select-arrow.svg" alt="" />{/if}
          </div>
          <div class="token-container"><span class="token-symbol"> {token.token_symbol.toUpperCase()} </span> <span class="token-amount"> 0 </span></div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .select-icon {
    width: 10px;
    /* height: 10px; */
  }
  .button-item {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .token-symbol {
    font-weight: 600;
  }
  .token-amount {
    font-weight: 400;
  }
  .token-container {
    width: 85%;
    display: flex;
    padding: 10px;
    justify-content: space-between;
  }

  .token-scroll {
    height: 100%;
    overflow-y: scroll;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .token-scroll::-webkit-scrollbar {
    display: none;
  }

  .token-list {
    padding-top: 15px;
    /* max-height: 300px; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .heading {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding-bottom: 30px;
  }

  .select-heading {
    width: 100%;
    justify-content: space-between;
    padding-bottom: 15px;
  }

  .token-select-wrapper {
    min-height: 600px;
    height: 70%;
    width: 370px;
    padding: 30px;
    border-radius: 30px;
    background-color: #312a43;
    display: flex;
    flex-direction: column;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    color: #d9d9d9;
    font-size: 1.2em;
    font-weight: 200;
    overflow-x: hidden;
    /* overflow-y: scroll; */
  }

  hr {
    margin-left: -30px;
    width: 480px;
    border-top: 0.5px solid #d9d9d90a;
  }
</style>
