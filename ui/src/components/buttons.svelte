
<script lang="ts">
  import { getContext } from 'svelte'
	import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  //Components
  import ConfirmAdd from './confirms/confirm-add.svelte'
  import ConfirmRemove from './confirms/confirm-remove.svelte'
  import ConfirmCreate from './confirms/confirm-create.svelte'
  import ConfirmSwap from './confirms/confirm-swap.svelte'

  //Misc
  import { config } from '../config'
  import { wallet_store } from '../store'

  //Services
  import { WalletService } from '../services/wallet.service'
  const walletService = WalletService.getInstance()

  //Props
  export let buttonFunction;
  export let currencyAmount;
  export let tokenAmount;
  export let selectedToken;
  export let buy;
  export let buttonText;

  const { pageStats } = getContext('pageContext');

  let open = false;

  $: disabled = disableButton(currencyAmount, tokenAmount, selectedToken, $pageStats);
  $: disabledText = undefined;


  const openConfirm = () => open = true;
  const closeConfirm = () => open = false;

  const disableButton = () => {
    disabledText = undefined;
    if (buttonFunction === "create" || buttonFunction === "add" || buttonFunction === "swap"){
      if ((!currencyAmount || !tokenAmount || !selectedToken)) return true
      if (currencyAmount.isEqualTo(0) || tokenAmount.isEqualTo(0)) return true

      if (currencyAmount.isGreaterThan($wallet_store.balance)){
        disabledText = `Insufficent ${config.currencySymbol}`
        return true
      }
      let tokenBalance = $wallet_store.tokens.balances[selectedToken.contract_name]
      if (tokenAmount.isGreaterThan(tokenBalance)){
        disabledText = `Insufficent ${selectedToken.token_symbol}`
        return true
      }
    }
    if (buttonFunction === "remove"){
      let lpTokenAmount = $pageStats?.lpTokenAmount;
      if (!lpTokenAmount) return true
      if (lpTokenAmount.isEqualTo(0)) return true
    }
    return false
  }

</script>


<button class="primary large full" disabled={disabled} on:click={openConfirm}> {disabledText || buttonText} </button>

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
    {#if buttonFunction === 'swap'}
      <ConfirmSwap {currencyAmount} {tokenAmount} {selectedToken} {closeConfirm} {buy}/>
    {/if}
  </div>
{/if}
