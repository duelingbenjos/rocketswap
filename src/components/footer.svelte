<script type="ts">
  import { onDestroy } from 'svelte'
  import type { WalletType, WalletInitType, WalletErrorType } from '../types/wallet.types'
  import { walletStore } from '../store'
  import { config } from '../config'
  import { formatAccountAddress } from '../utils'
  import { isWalletConnected, isWalletError, isWalletInit } from '../services/wallet.service'

  let wallet_info: WalletType
  $: wallet_info

  const wallet_unsub = walletStore.subscribe((wallet_update) => {
    console.log(wallet_update)
    wallet_info = wallet_update
  })

  onDestroy(() => {
    wallet_unsub()
  })

  function refreshPage() {
    location.reload()
  }
</script>

<div class="container">
  <div class="wallet-info">
    {#if isWalletInit(wallet_info)}
      <div class="wallet-message">Connecting to wallet...</div>
    {:else if (isWalletError(wallet_info) && wallet_info.errors[0] === 'Wallet is Locked') || (isWalletConnected(wallet_info) && wallet_info.locked)}
      <div class="wallet-button"><button on:click={() => refreshPage()}>Wallet is Locked</button></div>
    {:else if isWalletError(wallet_info) && wallet_info.errors[0] === 'not_installed'}
      <div class="wallet-message">Wallet not Installed</div>
    {:else if isWalletError(wallet_info)}
      <div class="wallet-message">{wallet_info.errors[0]}</div>
    {:else if isWalletConnected(wallet_info)}
      <div class="balance">{wallet_info.balance} {config.currencySymbol}</div>
      <div class="address">{formatAccountAddress(wallet_info.wallets[0])}</div>
    {/if}
    <div />
  </div>
</div>

<style>
  .wallet-button {
    display: flex;
    padding-right: 20px;
    padding-top: 15px;
    height: 100%;
  }
  .balance {
    padding-left: 20px;
  }

  .wallet-message {
    padding-right: 20px;
  }
  .address {
    margin: 3px 3px 0px 40px;
    padding: 5px 20px 5px 20px;
    height: 43px;
    background-color: #333862;
    border-radius: 13px;
    align-self: stretch;
    display: flex;
    align-items: center;
    font-weight: 200;
  }
  .wallet-info {
    background-color: #ffffff55;
    margin-left: 60px;
    border-radius: 15px;
    font-size: 30px;
    color: #ffffffa5;
    height: 60px;
    padding-left: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .container {
    background-color: #333862;
    height: 90px;
    width: 100%;
    display: flex;
    align-items: center;
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
