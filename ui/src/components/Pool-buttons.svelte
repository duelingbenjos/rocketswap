
<script lang="ts">

  //Stores
  import { wallet_store } from '../store'

  //Services
  import { WalletService } from '../services/wallet.service'
  const walletService = WalletService.getInstance()

  //Props
  export let buttonFunction;
  export let pageState;

  $: disabled = disableButton(pageState);

  const createMarket = () => {
    const { currencyAmount, tokenAmount, selectedToken } = pageState
    walletService.createMarket({
      'contract': selectedToken.contract_name,
      'currency_amount': {'__fixed__': currencyAmount.toString()},
      'token_amount': {'__fixed__': tokenAmount.toString()}
    })
  }

  const addLiquidity = () => {
    const { currencyAmount, tokenAmount, selectedToken } = pageState
    console.log(pageState)
    /*
    walletService.addLiquidity({
      'contract': selectedToken.contract_name,
      'currency_amount': {'__fixed__': currencyAmount.toString()},
      'token_amount': {'__fixed__': tokenAmount.toString()}
    })
    */
  }

  const disableButton = (info) => {
    if (!info) return true
    const { currencyAmount, tokenAmount, selectedToken } = info
    if (!currencyAmount || !tokenAmount || !selectedToken) {
      console.log('fill out all inputs')
      return true
    }
    return false
  }

</script>

{#if buttonFunction === 'create'}
  <button class="swap-button" disabled={disabled} on:click={createMarket}> Create Market </button>
{/if}

{#if buttonFunction === 'add'}
  <button class="swap-button" disabled={disabled} on:click={addLiquidity}> Supply </button>
{/if}

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
