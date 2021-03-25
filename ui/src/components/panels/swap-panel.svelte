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
	const { currencyAmount, tokenAmount, buy, selectedToken, tokenLP, payInRswp, currentPrice, lastTradeType } = pageStores

	let slots = [
		{
			component: InputCurrency,
			handler: handleCurrencyChange
		},
		{
			component: InputToken,
			handler: handleTokenChange
		}
	]

	const swapSlots = () => {
		slots = [...slots.reverse()]
		buy.set(!$buy)
	}

	function handleCurrencyChange(e){
		if (!e.detail) return
		if (e.detail.toString() === "NaN" || e.detail === 0) saveStoreValue(currencyAmount, null)
		else{
			saveStoreValue(currencyAmount, e.detail)
			if ($selectedToken && $tokenLP) {
				let quoteCalc = quoteCalculator($tokenLP)
				let quote = quoteCalc.calcBuyPrice($currencyAmount)

				if ($payInRswp && $buy){
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
		if (!e.detail) return
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN" || e.detail.tokenAmount.isEqualTo(0)) saveStoreValue(tokenAmount, null)
		else saveStoreValue(tokenAmount, e.detail.tokenAmount)

		if (e.detail.selected) saveStoreValue(selectedToken, e.detail.selected)

		if ($tokenLP && $tokenAmount){
			let quoteCalc = quoteCalculator($tokenLP)
			let quote = quoteCalc.calcSellPrice($tokenAmount)

			if ($payInRswp && !$buy){
				if (quote.currencyPurchased.isGreaterThan(0)){
					saveStoreValue(currencyAmount, toBigNumber(stringToFixed(quote.currencyPurchased, 8)))
				}else{
					saveStoreValue(currencyAmount, toBigNumber("0"))
				}
			}else{
				if (quote.currencyPurchasedLessFee.isGreaterThan(0)){
					saveStoreValue(currencyAmount, toBigNumber(stringToFixed(quote.currencyPurchasedLessFee, 8)))
				}else{
					saveStoreValue(currencyAmount, toBigNumber("0"))
				}
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
	.price{
		position: absolute;
		top: -12px;
		right: 20px;
		justify-content: flex-end;
		text-shadow: 1px 1px #c7c7c7;
	}
	.buy{
		color: var(--price-color-buy);
	}
	.sell{
		color: var(--error-color);
	}

	@media screen and (min-width: 430px) {
		.price{
			position: absolute;
			top: unset;
			right: unset;
			bottom: 0;
			left: 0px;
			width: 100%;
			text-align: center;
			justify-content: center;
		}
	}

</style>

<div class="panel-container">
	{#if $selectedToken && !$currentPrice.isNaN()}
		<div 
			class="flex-row flex-center-center price weight-600"
			class:buy={$lastTradeType === "buy"}
			class:sell={$lastTradeType !== "buy"}>
			{`$${stringToFixed($currentPrice, 4)} USD`}
			<DirectionalArrow 
				direction={$lastTradeType === "buy" ? "up" : "down"} 
				width="12px" 
				margin="0 0 -2px 4px"
				color={$lastTradeType === "buy" ? "var(--price-color-buy)" : "var(--error-color)"}
			/>
		</div>
	{/if}
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
