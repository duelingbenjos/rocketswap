<script lang="ts">
	import { onMount, setContext, beforeUpdate } from 'svelte'
	import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Components
	import HeadMeta from '../components/head-meta.svelte'
	import PoolRemoveLiquidityPanel from '../components/panels/pool-remove-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'
	
	//Misc
	import { quoteCalculator, stringToFixed, toBigNumber, pageUtils } from '../utils'
	import { walletIsReady, lwc_info, tokenBalances, saveStoreValue, lpBalances} from '../store'
	import { config } from '../config'

	let pageStats = writable()
	let currencyAmount = writable(null)
	let tokenAmount = writable(null)
	let selectedToken = writable()
	let tokenLP = writable()
	let lpBalance = writable()
	let lpTokenAmount = writable()
	let lpTokenPercentInput = writable(0)
	let txOkay = writable(true)

	let pageStores = {
		currencyAmount,
		tokenAmount,
		selectedToken,
		tokenLP,
		lpTokenPercentInput,
		lpTokenAmount,
		txOkay
	}

	let pageUtilites = pageUtils(pageStores)

	$: contractName = $params.contract
	$: pageTitle = $selectedToken ? `RocketSwap: ${$selectedToken.token_symbol}/${config.currencySymbol} Remove Liquidity` : 'RocketSwap: Remove Liquidity';
	$: pageDescription = $selectedToken ? `Remove liquidity for ${$selectedToken.token_symbol}/${config.currencySymbol}!` : 'Remove Liquidity!';
	$: addHref = $selectedToken ? `/#/pool-add/${$selectedToken.contract_name}` : `/#/pool-add/`;
	$: updateStats = updatePageStats($tokenLP, $walletIsReady, $lpTokenPercentInput)

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
		determineValues: true,
		pageStats,
		pageStores,
		resetPage: () => pageUtilites.resetPage(contractName, [lpTokenPercentInput, lpTokenAmount]),
		saveStoreValue,
		pageUtilites
	});

	onMount(() => {
		if (contractName) pageUtilites.refreshTokenInfo(contractName)
		else pageUtilites.redirectPoolMain()
	})

	const updatePageStats = async () => {
		let quoteCalc = quoteCalculator($tokenLP)
		let balance;
		let currentLpSharePercent = "0"
		let newLpSharePercent = "0%"
		let amounts;
		let lpTokenPercent = 0;
		let lpTokensToBurn = toBigNumber("0")

		if ($selectedToken) balance = $lpBalances[$selectedToken.contract_name]

		if (balance) {
			saveStoreValue(lpBalance, balance)
			lpTokenPercent = $lpTokenPercentInput / 100;
			lpTokensToBurn = balance.multipliedBy(lpTokenPercent)

			if (lpTokensToBurn.isEqualTo(balance) && lpTokensToBurn.isEqualTo(quoteCalc.totalLP)) lpTokensToBurn = lpTokensToBurn.minus(2)

			saveStoreValue(lpTokenAmount, lpTokensToBurn)

			currentLpSharePercent = stringToFixed(quoteCalc.calcLpPercent(balance).multipliedBy(100), 1)
			newLpSharePercent = stringToFixed(quoteCalc.calcNewShare_removeTokens(balance, lpTokensToBurn).multipliedBy(100), 1)

			amounts = quoteCalc.calcAmountsFromLpTokens(lpTokensToBurn)
		} else {
			saveStoreValue(lpBalance, toBigNumber("0"))
		}

		pageStats.set({
			quoteCalc,
			lpTokenPercent,
			currentLpSharePercent,
			newLpSharePercent,
			amounts
		})
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
	a{
		height: 24px;
	}
</style>


<HeadMeta {pageTitle} {pageDescription} />

<div class="page-container">
	<PoolRemoveLiquidityPanel>
		<div class="header" slot="header">
			<span class="page-heading">Remove Liquidity</span>
			<div class="page-controls flex-row">
				<a href="/#/pool-main/">
					<IconBackArrow />
				</a>
				<a href={addHref} class="text-link underline" >add</a>
			</div>
		</div>
			
		<div class="footer" slot="footer">
			{#if $selectedToken && $tokenLP}
				<!--<PoolStats statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>-->
			{/if}
			<Buttons buttonFunction="remove" buttonText="Remove Supply"/>
		</div>
	</PoolRemoveLiquidityPanel>
</div>



