<script lang="ts">
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();
	import { WsService } from '../services/ws.service'
	const ws = WsService.getInstance()

	//Stores
	import { tokenBalances, walletIsReady, saveStoreValue, walletAddress, slippageTolerance, rswpPrice, payInRswp  } from '../store'
	
	//Misc
	import { stringToFixed, quoteCalculator, toBigNumber, pageUtils } from '../utils'
	import { connectionRequest, config } from '../config'

	//Components
	import HeadMeta from '../components/head-meta.svelte'
	import SwapPanel from '../components/panels/swap-panel.svelte'
	import TradeTable from '../components/misc/trade-table.svelte'
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
	let txOkay = writable(true)

	let pageStores = {
		currencyAmount,
		tokenAmount,
		selectedToken,
		buy,
		tokenLP,
		payInRswp,
		txOkay
	}

	let pageUtilites = pageUtils(pageStores)

	$: contractName = $params.contract
	$: pageTitle = $selectedToken ? `RocketSwap: ${$selectedToken.token_symbol}/${config.currencySymbol}` : 'RocketSwap';
	$: pageDescription = $selectedToken ? `Swap ${$selectedToken.token_symbol}/${config.currencySymbol}!` : 'The Fastest Swaps in Crypto!';
	$: updateStats = updatePageStats($buy, $currencyAmount, $walletIsReady, $tokenAmount, $selectedToken, $slippageTolerance, $rswpPrice, $payInRswp)

	selectedToken.subscribe(value => {
		if (value) {
			joinTradeFeed_UpdateWindow(value.contract_name)
		}
	})

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
		determineValues: true,
		pageStats,
		resetPage: () => pageUtilites.resetPage(contractName, [currencyAmount, tokenAmount]),
		pageStores,
		saveStoreValue,
		getStampCost
	});

	onMount(() => {
		if (contractName) joinTradeFeed_UpdateWindow(contractName)
		return () => ws.leaveTradeFeed()
	})

	const joinTradeFeed_UpdateWindow = (contract_name) => {
		pageUtilites.refreshTokenInfo(contract_name).then(res => {
			if (res){
				pageUtilites.updateWindowHistory("")
				ws.joinTradeFeed(contract_name)
			}else{
				pageUtilites.updateWindowHistory("", false)
			}
		})
	}
	
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

	async function getStampCost(){
		let txList = [
			{contract: connectionRequest.contractName, method: $buy ? "buy" : "sell"}
		]
		let inputAmount = toBigNumber("0");
		if ($buy) {
			if ($currencyAmount) inputAmount = $currencyAmount
			if (await walletService.needsApproval("currency", inputAmount)){
				txList.push({contract: "currency", method: "approve"})
			}
		}else{
			if ($tokenAmount) inputAmount = $tokenAmount
			if (await walletService.needsApproval(contractName, inputAmount)){
				txList.push({contract: contractName, method: "approve"})
			}			
		}
		return await walletService.estimateTxCosts(txList)
	}
</script>

<style>
	div.footer{
		padding-top: 1rem;
	}
</style>


<HeadMeta {pageTitle} {pageDescription} />

<div class="page-container">
	<SwapPanel>
		<div class="footer" slot="footer">
			<SwapInfoBox />
		<Buttons buttonFunction="swap" buttonText="Swap" />
		</div>
	</SwapPanel>
	<TradeTable />
</div>
