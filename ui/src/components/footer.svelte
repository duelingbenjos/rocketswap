<script type="ts">
  import { onDestroy } from 'svelte'
  import type { WalletType, WalletInitType, WalletErrorType } from '../types/wallet.types'
  import { wallet_store } from '../store'
  import { config } from '../config'
  import { formatAccountAddress, stripTrailingZero } from '../utils'
  import { isWalletConnected, isWalletError, isWalletInit } from '../services/wallet.service'

  let wallet_info: WalletType
  $: wallet_info

  const wallet_unsub = wallet_store.subscribe((wallet_update) => {
    wallet_info = wallet_update
  })

  onDestroy(() => {
    wallet_unsub()
  })

  function refreshPage() {
    location.reload()
  }

  const openWalletUrl = () => window.open(`${config.blockExplorer}/addresses/${wallet_info.wallets[0]}`);
</script>

<div class="container">
  <div class="wallet-info">
    {#if isWalletInit(wallet_info)}
      <div class="wallet-message">Connecting to wallet...</div>
    {:else if (isWalletError(wallet_info) && wallet_info.errors[0] === 'Wallet is Locked') || (isWalletConnected(wallet_info) && wallet_info.locked)}
      <div class="wallet-button">
        <button on:click={() => refreshPage()}>Wallet is Locked</button>
      </div>
    {:else if isWalletError(wallet_info) && wallet_info.errors[0] === 'not_installed'}
      <div class="wallet-message">Wallet not Installed</div>
    {:else if isWalletError(wallet_info)}
      <div class="wallet-message">{wallet_info.errors[0]}</div>
    {:else if isWalletConnected(wallet_info)}
      <div class="balance">{stripTrailingZero(wallet_info.balance.toFixed(8))} {config.currencySymbol}</div>
      <button class="primary medium" on:click={openWalletUrl}>{formatAccountAddress(wallet_info.wallets[0],4,2)}</button>
    {/if}
    <div />
  </div>
</div>

<style>
  .wallet-button {
    display: flex;
    padding-right: 16px;
    padding-top: 12px;
    height: 100%;
  }
  .balance {
    padding-left: 8px;
  }

  .wallet-message {
    padding-right: 16px;
  }
  .address {
    margin: 3px 3px 0px 32px;
    padding: 5px 16px 4px 16px;
    height: 33px;
    background-color: var(--color-gray-2);
    border-radius: var(--border-radius);
    align-self: stretch;
    display: flex;
    align-items: center;
    font-weight: 200;
  }
  .wallet-info {
    background-color: var(--color-secondary);
    margin-left: 48px;
    border-radius: var(--border-radius);
    font-size: var(--text-size-large);
    padding-left: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .container {
    background-color: transparent;
    width: 100%;
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 15px;
    color: var(--wallet-info-text);
  }
  button.primary{
    border-radius: var(--border-radius);
    margin-left: 10px;
  }
</style>
