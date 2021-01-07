<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Stores
  import { lwc_info, tokenBalances, walletIsReady } from '../store'
  
  //Misc
  import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'

	//Components
  import SwapPanel from '../components/swap-panel.svelte'
  import SwapInfoBox from '../components/misc/swap-info-box.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState = {};
  let pageStats = writable()
  let resetInputAmounts

	$: contractName = $params.contract
	$: getTokenBalance = refreshTokenBalance($walletIsReady, $tokenBalances)
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
    console.log(e)
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
    if (!$walletIsReady) return {}
    let vk = $lwc_info.walletAddress;
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
		if (!$walletIsReady) tokenRes.token.balance = toBigNumber("0")
		else tokenRes.token.balance = $tokenBalances[tokenRes.token.contract_name] || toBigNumber("0");
		return tokenRes
	}

	const getTokenInfo = async (contractName) => {
		return apiService.getToken(contractName)
	}

  const refreshTokenBalance = () => {
    console.log("refreshing")
    if (!pageState.selectedToken) return
    let newBal = $tokenBalances[pageState.selectedToken.contract_name] || 0;
    if (newBal !== pageState.selectedToken.balance) pageState.selectedToken.balance = newBal
  }

  const updateWindowHistory = () => {
    if (pageState.selectedToken){
      if (!location.pathname.includes(pageState.selectedToken.contract_name))
        window.history.pushState("", "", `/#/${pageState.selectedToken.contract_name}`);
    }
  }

</script>

<style>
  div.footer{
    padding-top: 1rem;
  }
</style>


<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="page-container">
  <SwapPanel on:infoUpdate={handleInfoUpdate} {pageState} bind:resetInputAmounts>
    <div class="footer" slot="footer">
      {#if pageState.currencyAmount && pageState.tokenAmount && pageState.tokenLP}
        <SwapInfoBox {pageState} />
      {/if}
      <Buttons buttonFunction="swap" buttonText="Swap" {...pageState} />
    </div>
  </SwapPanel>
</div>
