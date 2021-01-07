<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'

	//Router
  	import { active } from 'svelte-hash-router'

	//Components
	import InputCurrency from './misc/input-currency.svelte'
	import InputToken from './misc/input-token.svelte'
	import Buttons from './buttons.svelte'
	import DirectionalArrow from '../icons/directional-arrow.svelte'

	//Misc
	import { quoteCalculator, toBigNumber } from '../utils'

	//Props
	export let pageState;
	export const resetInputAmounts = resetAmounts;

	$: quoteCalc = quoteCalculator(pageState?.tokenLP);

	const dispatch = createEventDispatcher();
	const { determineValues,  } = getContext('pageContext')

	let state = { buy: true };

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
		state = Object.assign(state, {buy: !state.buy});
		dispatchEvent(state)
	}

	afterUpdate(() => {
		if (pageState.selectedToken && (state.selectedToken?.contract_name !== pageState.selectedToken?.contract_name)){
			state.selectedToken = pageState.selectedToken
		}
	})

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN") state.currencyAmount = null
		else{
			state.currencyAmount = e.detail
			if (state.selectedToken && pageState.tokenLP) {
				let quoteCalc = quoteCalculator(pageState.tokenLP)
				let quote = quoteCalc.calcBuyPrice(state.currencyAmount)
				state.tokenAmount = quote.tokensPurchasedLessFee
			}
		}
		dispatchEvent(state)
	}

	function handleTokenChange(e) {
		console.log(e)
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN") state.tokenAmount = null
		else state.tokenAmount = e.detail.tokenAmount

		if (e.detail.selectedToken) state.selectedToken = e.detail.selectedToken
		if (pageState.tokenLP && state.tokenAmount){
			let quoteCalc = quoteCalculator(pageState.tokenLP)
			let quote = quoteCalc.calcSellPrice(state.tokenAmount)
			state.currencyAmount = quote.currencyPurchasedLessFee
		}
		dispatchEvent(state)
	}

	function resetAmounts() {
		state = Object.assign({currencyAmount: null, tokenAmount: null})
		dispatchEvent(state)
	}

	const dispatchEvent = (value) => dispatch('infoUpdate', value)
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
		{...state}
	/>
	<div class="plus-sign" on:click={swapSlots}>
		<DirectionalArrow 
			direction={state.buy ? "down" : "up"} width={"20px"} 
			margin={"1rem 0"} />
	</div>

	<svelte:component 
		label={'To'}
		this={slots[1].component}
		on:input={slots[1].handler}
		{...state}
	/>
	<slot name="footer"></slot>
</div>
