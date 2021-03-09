<script lang="ts">
	import { getContext } from 'svelte'

	//Components
	import InputCurrency from '../inputs/input-currency.svelte'
	import InputToken from '../inputs/input-token.svelte'
	import Buttons from '../buttons.svelte'
	import DirectionalArrow from '../../icons/directional-arrow.svelte'

	//Misc
	import { quoteCalculator, toBigNumber, stringToFixed } from '../../utils'

	const { determineValues, pageStores, saveStoreValue } = getContext('pageContext')
	const { currencyAmount, tokenAmount, buy, selectedToken, tokenLP, payInRswp } = pageStores

	let slots = [
		{
			component: InputCurrency,
			handler: handleCurrencyChange,
		},
		{
			component: InputToken,
			handler: handleTokenChange,
		}
	]

	const swapSlots = () => {
		slots = [...slots.reverse()]
		buy.set(!$buy)
		console.log($buy)
	}

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN" || e.detail.isEqualTo(0)) saveStoreValue(currencyAmount, null)
		else{
			saveStoreValue(currencyAmount, e.detail)
			if ($selectedToken && $tokenLP) {
				let quoteCalc = quoteCalculator($tokenLP)
				let quote = quoteCalc.calcBuyPrice($currencyAmount)
				/*
				console.log("SWAP PANEL - HANDLE_CURRECNY_CHANGE")
				console.log({
					fee: quote.fee.toString(),
					new_price_currency: quote.newPrices.currency.toString(),
					new_price_token: quote.newPrices.token.toString(),
					new_reserves_currency:  quote.newPrices.reserves[0].toString(),
					new_reserves_token:  quote.newPrices.reserves[1].toString(),
					price_currency: quoteCalc.prices.currency.toString(),
					price_token: quoteCalc.prices.token.toString(),
					reserves_currency:  quoteCalc.prices.reserves[0].toString(),
					reserves_token:  quoteCalc.prices.reserves[1].toString(),
					tokensPurchased: quote.tokensPurchased.toString(),
					tokensPurchasedLessFee: quote.tokensPurchasedLessFee.toString()
				})*/
				console.log($payInRswp)
				if ($payInRswp){
					console.log("PAYING IN RSWP!")
					if (quote.tokensPurchased.isGreaterThan(0)){
						saveStoreValue(tokenAmount, toBigNumber(stringToFixed(quote.tokensPurchased, 8)))
					}else{
						saveStoreValue(tokenAmount, toBigNumber("0"))
					}
				}else{
					if (quote.tokensPurchasedLessFee.isGreaterThan(0)){
						saveStoreValue(tokenAmount, toBigNumber(stringToFixed(quote.tokensPurchasedLessFee, 8)))
					}else{
						saveStoreValue(tokenAmount, toBigNumber("0"))
					}
				}
			}
		}
	}

	function handleTokenChange(e) {
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN" || e.detail.tokenAmount.isEqualTo(0)) saveStoreValue(tokenAmount, null)
		else saveStoreValue(tokenAmount, e.detail.tokenAmount)

		if (e.detail.selected) saveStoreValue(selectedToken, e.detail.selected)

		if ($tokenLP && $tokenAmount){
			let quoteCalc = quoteCalculator($tokenLP)
			let quote = quoteCalc.calcSellPrice($tokenAmount)
			if ($payInRswp){
				saveStoreValue(currencyAmount, toBigNumber(stringToFixed(quote.currencyPurchased, 8)))
			}else{
				saveStoreValue(currencyAmount, toBigNumber(stringToFixed(quote.currencyPurchasedLessFee, 8)))
			}
		}
	}
</script>

<style>
	.plus-sign{
		display: flex;
		justify-content: center;
		text-align: center;
		padding: 5px 0;
	}

</style>

<div class="panel-container">
	<slot name="header"></slot>
	<svelte:component 
		label={'From'}
		this={slots[0].component}
		on:input={slots[0].handler}
	/>
	<div class="plus-sign flex flex-center-center">
		<DirectionalArrow 
			direction="down" width={"20px"} 
			margin={"0.5rem 0 0"} 
			hover={true}
			click={swapSlots}/>
	</div>
	<svelte:component 
		label={'To'}
		this={slots[1].component}
		on:input={slots[1].handler}
	/>
	<slot name="footer"></slot>
</div>
