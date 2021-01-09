<script lang="ts">
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Stores
	import { lwc_info, tokenBalances, walletIsReady, saveStoreValue,  } from '../store'
	
	//Misc
	import { stringToFixed, quoteCalculator, toBigNumber, pageUtils } from '../utils'

	//Components
	import SwapPanel from '../components/swap-panel.svelte'
	import SwapInfoBox from '../components/misc/swap-info-box.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

	let pageStats = writable()
	let currencyAmount = writable(null)
	let tokenAmount = writable(null)
	let selectedToken = writable()
	let tokenLP = writable()
	let buy = writable(true)

	let pageStores = {
		currencyAmount,
		tokenAmount,
		selectedToken,
		buy,
		tokenLP
	}

	let pageUtilites = pageUtils(pageStores)

	$: contractName = $params.contract
	$: pageTitle = $selectedToken ? `RocketSwap TAU/${$selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
	$: addHref = $selectedToken ? `/#/pool-add/${$selectedToken.contract_name}` : false;
	$: updateStats = updatePageStats($buy, $currencyAmount, $walletIsReady, $tokenAmount, $selectedToken)

	selectedToken.subscribe(value => {
		if (value) pageUtilites.refreshTokenInfo(value.contract_name)
	})

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
		determineValues: true,
		pageStats,
		resetPage: () => pageUtilites.resetPage(contractName, [currencyAmount, tokenAmount]),
		pageStores,
		saveStoreValue
	});

	onMount(() => {
		if (contractName) pageUtilites.refreshTokenInfo(contractName)
	})
	
	
	const updatePageStats = async () => {
		let quoteCalc = quoteCalculator($tokenLP)
		let quote;
		if ($buy) quote = quoteCalc.calcBuyPrice($currencyAmount)      
		else quote = quoteCalc.calcSellPrice($tokenAmount)
		
		pageStats.set({
			quoteCalc,
			...quote
		})
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
	<SwapPanel>
		<div class="footer" slot="footer">
		{#if $currencyAmount && $tokenAmount && $tokenLP}
			<SwapInfoBox />
		{/if}
		<Buttons buttonFunction="swap" buttonText="Swap" />
		</div>
	</SwapPanel>
</div>
