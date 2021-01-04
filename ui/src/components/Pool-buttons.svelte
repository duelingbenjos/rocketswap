
<script lang="ts">
  import { getContext } from 'svelte'
	import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  //Components
  import ConfirmAdd from './confirms/confirm-add.svelte'
  import ConfirmRemove from './confirms/confirm-remove.svelte'
  import ConfirmCreate from './confirms/confirm-create.svelte'

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

  const { pageStats } = getContext('pageContext');

  let open = false;

  $: disabled = disableButton(currencyAmount, tokenAmount, selectedToken, $pageStats);


  const openConfirm = () => open = true;
  const closeConfirm = () => open = false;

  const disableButton = () => {
    if (buttonFunction === "create" || buttonFunction === "add"){
      if ((!currencyAmount || !tokenAmount || !selectedToken)) return true
      if (currencyAmount.isEqualTo(0) || tokenAmount.isEqualTo(0)) return true
    }
    if (buttonFunction === "remove"){
      let lpTokenAmount = $pageStats?.lpTokenAmount;
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
  <button class="swap-button" disabled={disabled} on:click={openConfirm}> Create Supply </button>
{/if}

{#if buttonFunction === 'add'}
  <button class="swap-button" disabled={disabled} on:click={openConfirm}> Add Supply </button>
{/if}

{#if buttonFunction === 'remove'}
  <button class="swap-button" disabled={disabled} on:click={openConfirm}> Remove Supply </button>
{/if}

{#if open}
  <div class="modal"
       in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
       out:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
    {#if buttonFunction === 'create'}
      <ConfirmCreate {currencyAmount} {tokenAmount} {selectedToken} {closeConfirm}/>
    {/if}
    {#if buttonFunction === 'add'}
      <ConfirmAdd {currencyAmount} {tokenAmount} {selectedToken} {closeConfirm}/>
    {/if}
    {#if buttonFunction === 'remove'}
      <ConfirmRemove {selectedToken} {closeConfirm}/>
    {/if}
  </div>
{/if}
