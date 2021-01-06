<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Stores
  import { wallet_store } from '../store'
  
  //Misc
  import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'

	//Components
  import SwapPanel from '../components/swap-panel-2.svelte'
  import Prices from '../components/misc/prices.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState = {};
  let pageStats = writable()
  let resetInputAmounts

	$: contractName = $params.contract
	$: getTokenBalance = refreshTokenBalance($wallet_store)
	$: pageTitle = pageState.selectedToken ? `RocketSwap TAU/${pageState.selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
  $: addHref = pageState.selectedToken ? `/#/pool-add/${pageState.selectedToken.contract_name}` : false;
  

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
    determineValues: true,
    pageStats,
    resetPage
  });

  onMount(() => {
    if (contractName) refreshTokenInfo()
  })
  
  function resetPage () {
    resetInputAmounts()
    setTimeout(refreshTokenInfo, 2000)
  }

	async function handleInfoUpdate(e) {
		if (e.detail.selectedToken){
			let tokenRes = await getTokenInfo(e.detail.selectedToken.contract_name)
			applyTokenBalance(tokenRes)
			const { token: selectedToken, lp_info: tokenLP }  = tokenRes
      pageState = Object.assign(pageState, e.detail, {selectedToken, tokenLP} )
      updateStatsStore()
		}else{
			pageState = Object.assign(pageState, e.detail)
		}
		updateWindowHistory()
  }
  
  const updateStatsStore = async () => {
    const { currencyAmount, tokenAmount, tokenLP, selectedToken, buy } = pageState

    let quoteCalc = quoteCalculator(tokenLP)

    let quote;
    if (buy) quote = quoteCalc.calcBuyPrice(currencyAmount)      
    else quote = quoteCalc.calcSellPrice(tokenAmount)
    
    pageStats.set({
      quoteCalc,
      ...quote
    })
  }

  const setLpBalances = async () => {
    if ($wallet_store.init) return {}
      let vk = $wallet_store?.wallets[0];
      if (vk){
          let balancesRes = await apiService.getUserLpBalance(vk)
          if (balancesRes) return balancesRes.points
          else return {}
      }
  }

	const refreshTokenInfo = async () => {
		let tokenRes = await getTokenInfo(contractName)
		applyTokenBalance(tokenRes)
		const { token: selectedToken, lp_info: tokenLP }  = tokenRes
    pageState = Object.assign(pageState, {selectedToken, tokenLP} )
    updateStatsStore();
	}

	const applyTokenBalance = (tokenRes) => {
		if ($wallet_store.init) tokenRes.token.balance = 0
		else tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;
		return tokenRes
	}

	const getTokenInfo = async (contractName) => {
		return apiService.getToken(contractName)
	}

  const refreshTokenBalance = () => {
    if (!pageState.selectedToken) return
    let newBal = $wallet_store?.tokens?.balances[pageState.selectedToken.contract_name] || 0;
    if (newBal !== pageState.selectedToken.balance) pageState.selectedToken.balance = newBal
  }

  const updateWindowHistory = () => {
    if (pageState.selectedToken){
      if (!location.pathname.includes(pageState.selectedToken.contract_name))
        window.history.pushState("", "", `/#/swap-test/${pageState.selectedToken.contract_name}`);
    }
  }

</script>

<style>
  div.header{
    position: relative;
    height: 35px;
    margin: 0 0 1rem;
  }
  div.footer{
    padding-top: 1rem;
  }
  h2{
    position: absolute;

    width: 100%;
    height: 100%;
    margin: 0;

    display: flex;
    justify-content: center;
    align-items: center;

  }
  .controls{
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: flex-end;
    align-items: center;
  }
  a{
    height: 24px;
  }
</style>


<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="page-container">
  <SwapPanel on:infoUpdate={handleInfoUpdate} {pageState} bind:resetInputAmounts>
    <div class="header" slot="header">
      <h2>swap</h2>
      <div class="controls flex-row">
        {#if addHref}
          <a href={addHref} class="text-link underline" >add liquidity</a>
        {/if}
      </div>
    </div>
    
    <div class="footer" slot="footer">
      {#if pageState.selectedToken && pageState.tokenLP}
        <Prices {pageState} label={"Price"}/>
      {/if}
      <Buttons buttonFunction="swap" buttonText="Swap" {...pageState} />
    </div>
  </SwapPanel>
</div>
