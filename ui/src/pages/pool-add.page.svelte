<script>
  	import { onMount, setContext } from 'svelte'
  	import { writable } from 'svelte/store'

	//Router
	import { params, active } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();
	
	//Misc
	import { stringToFixed, quoteCalculator, toBigNumber, pageUtils } from '../utils'
	import { walletIsReady, lwc_info, tokenBalances, lpBalances, saveStoreValue } from '../store'
	import { connectionRequest, config } from '../config'

	//Components
	import HeadMeta from '../components/head-meta.svelte'
	import PoolSwapPanel from '../components/panels/pool-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

	let pageStats = writable()
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
	$: pageTitle = $selectedToken ? `RocketSwap: ${$selectedToken.token_symbol}/${config.currencySymbol}` : 'RocketSwap Add Liquidity!';
	$: pageDescription = $selectedToken ? `Add liquidity to the ${$selectedToken.token_symbol}/${config.currencySymbol} pool!` : 'Add Liquidity!';
	$: removeHref = $selectedToken ? `/#/pool-remove/${$selectedToken.contract_name}` : false;
	$: updateStats = updatePageStats($walletIsReady, $tokenLP, $lpBalances, $currencyAmount)

	selectedToken.subscribe(value => {
		if (value) {
			if (!value.has_market){
				pageUtilites.redirectToCreatePool(value.contract_name)
			}else{
				pageUtilites.refreshTokenInfo(value.contract_name)
				pageUtilites.updateWindowHistory("pool-add/")
			}
		}
	})

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
		determineValues: true,
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

	async function updatePageStats() {
		let quoteCalc = quoteCalculator($tokenLP)
		let lpToMint = quoteCalc.calcNewLpMintAmount($currencyAmount)
		let balance

		if ($selectedToken) balance = $lpBalances[$selectedToken.contract_name]

		let currentLpSharePercent = "0"
		let newLpSharePercent = "0%"

		if (balance) {
			saveStoreValue(lpBalance, balance)
			currentLpSharePercent = stringToFixed(quoteCalc.calcLpPercent(balance).multipliedBy(100), 1)
			newLpSharePercent = stringToFixed(quoteCalc.calcNewShare(balance, $currencyAmount).multipliedBy(100), 1)
		
		} else saveStoreValue(lpBalance, toBigNumber("0"))

		pageStats.set({
			quoteCalc,
			lp_balance: balance,
			currentLpSharePercent,
			newLpSharePercent,
			lpToMint
		})
	}
	
	async function getStampCost(){
		let txList = [{contract: connectionRequest.contractName, method: "add_liquidity"}]
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
	<PoolSwapPanel>
		<div class="header" slot="header">
			<span class="page-heading">Add Liquidity</span>
			<div class="page-controls flex-row">
				<a href="/#/pool-main/">
					<IconBackArrow />
				</a>
				{#if removeHref}
					<a href={removeHref} class="text-link underline" >remove</a>
				{/if}
			</div>
		</div>
			
		<div class="footer" slot="footer">
			{#if $selectedToken && $tokenLP}
				<PoolStats statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>
			{/if}
			<Buttons buttonFunction="add" buttonText="Add Supply"  />
		</div>
	</PoolSwapPanel>
</div>



