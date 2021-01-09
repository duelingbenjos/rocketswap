<script lang="ts">
	import { getContext } from 'svelte'

	//Components
	import InputCurrency from './misc/input-currency.svelte'
	import InputToken from './misc/input-token.svelte'
	import Buttons from './buttons.svelte'
	import DirectionalArrow from '../icons/directional-arrow.svelte'

	//Misc
	import { quoteCalculator, toBigNumber } from '../utils'

	const { determineValues, pageStores, saveStoreValue } = getContext('pageContext')
	const { currencyAmount, tokenAmount, buy, selectedToken, tokenLP } = pageStores

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
	}

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN") saveStoreValue(currencyAmount, null)
		else{
			saveStoreValue(currencyAmount, e.detail)
			if ($selectedToken && $tokenLP) {
				let quoteCalc = quoteCalculator($tokenLP)
				let quote = quoteCalc.calcBuyPrice($currencyAmount)
				saveStoreValue(tokenAmount, quote.tokensPurchasedLessFee)
			}
		}
	}

	function handleTokenChange(e) {
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN") saveStoreValue(tokenAmount, null)
		else saveStoreValue(tokenAmount, e.detail.tokenAmount)

		if (e.detail.selected) saveStoreValue(selectedToken, e.detail.selected)

		if ($tokenLP && $tokenAmount){
			let quoteCalc = quoteCalculator($tokenLP)
			let quote = quoteCalc.calcSellPrice($tokenAmount)
			saveStoreValue(currencyAmount, quote.currencyPurchasedLessFee)
		}
	}
</script>

<style>
.plus-sign{
	display: flex;
	justify-content: center;
	text-align: center;
}
</style>

<div class="panel-container">
	<slot name="header"></slot>
	<svelte:component 
		label={'From'}
		this={slots[0].component}
		on:input={slots[0].handler}
	/>
	<div class="plus-sign" on:click={swapSlots}>
		<DirectionalArrow 
			direction={$buy ? "down" : "up"} width={"20px"} 
			margin={"1rem 0"} />
	</div>
	<svelte:component 
		label={'To'}
		this={slots[1].component}
		on:input={slots[1].handler}
	/>
	<slot name="footer"></slot>
</div>
