
<script lang="ts">

  //Stores
  import { wallet_store } from '../store'

  //Services
  import { WalletService } from '../services/wallet.service'
  const walletService = WalletService.getInstance()

  //Props
  export let buttonFunction;
  export let currencyAmount;
  export let tokenAmount;
  export let selectedToken;
  export let lpTokenAmount;

  $: disabled = disableButton(currencyAmount, tokenAmount, selectedToken, lpTokenAmount);

  const createMarket = () => {
    if (!currencyAmount || !tokenAmount || !selectedToken) return
    walletService.createMarket({
      'contract': selectedToken.contract_name,
      'currency_amount': {'__fixed__': currencyAmount.toString()},
      'token_amount': {'__fixed__': tokenAmount.toString()}
    }, selectedToken, tokenAmount, currencyAmount)
  }

  const addLiquidity = () => {
    if (!currencyAmount || !tokenAmount || !selectedToken) return
    walletService.addLiquidity({
      'contract': selectedToken.contract_name,
      'currency_amount': {'__fixed__': currencyAmount.toString()}
    }, selectedToken, tokenAmount, currencyAmount)
  }

  const removeLiquidity = () => {
    if (!lpTokenAmount) return
    walletService.removeLiquidity({
      'contract': selectedToken.contract_name,
      'amount': {'__fixed__': lpTokenAmount.toString()}
    }, selectedToken)
  }

  const disableButton = (info) => {
    if (buttonFunction === "create" || buttonFunction === "add"){
      if (!currencyAmount || !tokenAmount || !selectedToken) return true
    }
    if (buttonFunction === "remove"){

      if (!lpTokenAmount) return true
      if (lpTokenAmount.isEqualTo(0)) return true
    }
    return false
  }

</script>

<style>
  .swap-button {
    width: 100%;
    background-color: #1d2fba;
    color: #fff;
    height: 56px;
    border-radius: 24px;
    font-size: 1.6em;
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  button:hover {
    filter: brightness(110%);
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
  button:disabled{
    filter: saturate(40%);
    color: rgb(230, 230, 230);
  }

</style>


{#if buttonFunction === 'create'}
  <button class="swap-button" disabled={disabled} on:click={createMarket}> Create Market </button>
{/if}

{#if buttonFunction === 'add'}
  <button class="swap-button" disabled={disabled} on:click={addLiquidity}> Supply </button>
{/if}

{#if buttonFunction === 'remove'}
  <button class="swap-button" disabled={disabled} on:click={removeLiquidity}> Remove </button>
{/if}
