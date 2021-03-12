<script>
	import {onMount, setContext, beforeUpdate } from 'svelte'
	import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();

	//Components
	import PoolSwapPanel from '../components/panels/pool-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'

	//Icons
	import IconBackArrow from '../icons/back-arrow.svelte'

	//Misc
	import { quoteCalculator, pageUtils, toBigNumber } from '../utils'
	import { walletIsReady, tokenBalances, saveStoreValue } from '../store'
	import { connectionRequest } from '../config'

	let pageStats = writable({})
	let currencyAmount = writable(null)
	let tokenAmount = writable(null)
	let selectedToken = writable()
	let tokenLP = writable()
	let lpBalance = writable()
	let txOkay = writable(true)

	let pageStores = {
		currencyAmount,
		tokenAmount,
		selectedToken,
		tokenLP,
		lpBalance,
		txOkay
	}

	let pageUtilites = pageUtils(pageStores)

	$: contractName = $params.contract
	$: pageTitle = $selectedToken ? `RocketSwap Create ${$selectedToken.token_symbol} Pool` : 'RocketSwap Create Pool';
	$: updateStats = updatePageStats($currencyAmount, $tokenAmount)

	selectedToken.subscribe(value => {
			if (value) {
		if (value.has_market){
			pageUtilites.redirectToAddPool(value.contract_name)
		}else{
			pageUtilites.refreshTokenInfo(value.contract_name)
			pageUtilites.updateWindowHistory("pool-create/")
		}
			}
	})

	setContext('pageContext', {
		getTokenList: async () => await apiService.getTokenList(["no-market"]),
		determineValues: false,
		pageStats,
		resetPage: () => pageUtilites.resetPage(contractName, [currencyAmount, tokenAmount]),
		pageStores,
		saveStoreValue,
		getStampCost,
		showMax: true
	});

	onMount(() => {
		if (contractName) pageUtilites.refreshTokenInfo(contractName)
	})


	const updatePageStats = async () => {
		let quoteCalc = quoteCalculator({reserves: [$currencyAmount, $tokenAmount]})
		let initialLPToMint = quoteCalc.calcInitialLpMintAmount()

		pageStats.set({
			quoteCalc,
			initialLPToMint
		})
	}

	async function getStampCost(){
		let txList = [{contract: connectionRequest.contractName, method: "create_liquidity"}]
		let inputCurrencyAmount = toBigNumber("0");
		let inputTokenAmount = toBigNumber("0");
		if ($currencyAmount) inputCurrencyAmount = $currencyAmount
		if ($tokenAmount) inputCurrencyAmount = $tokenAmount
		if (await walletService.needsApproval('currency', inputCurrencyAmount)){
			txList.push({contract: 'currency', method: "approve"})
		}
		if (await walletService.needsApproval(contractName, inputTokenAmount)){
			txList.push({contract: contractName, method: "approve"})
		}
		return await walletService.estimateTxCosts(txList)
	}
</script>

<style>
	div.header{
		position: relative;
		height: 35px;
		margin: 0 0 0.5rem;
	}
	div.footer{
		margin: 1rem 0 0;
	}
	a{
		height: 24px;
	}
</style>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>


<div class="page-container">
	<PoolSwapPanel>
	<div class="header" slot="header">
		<span class="page-heading">Create Pair</span>
		<div class="page-controls flex-row">
			<a href="/#/pool-main/">
				<IconBackArrow />
			</a>
		</div>
	</div>
	<div class="footer" slot="footer">
		{#if $selectedToken }
			<PoolStats statList={["ratios"]} title={"Initial prices and pool share"}/>
		{/if}
		<Buttons buttonFunction="create" buttonText="Create Supply" />
	</div>
	</PoolSwapPanel>
</div>



