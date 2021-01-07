<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'

	//Router
  	import { active } from 'svelte-hash-router'

	//Components
	import InputCurrency from './misc/input-currency.svelte'
	import InputToken from './misc/input-token.svelte'
	import Buttons from './buttons.svelte'
	import IconPlusSign from '../icons/plus-sign.svelte'

	//Misc
	import { quoteCalculator, toBigNumber, stringToFixed } from '../utils'

	//Props
	export let pageState;
	export const resetInputAmounts = resetAmounts;

	$: quoteCalc = quoteCalculator(pageState?.tokenLP);

	const dispatch = createEventDispatcher();
	const { determineValues,  } = getContext('pageContext')

	let state = { };

	afterUpdate(() => {
		state.selectedToken = pageState.selectedToken
	})

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN") state.currencyAmount = null
		else{
			state.currencyAmount = e.detail
			const { tokenLP } = pageState 
			if (tokenLP){
				let qc = quoteCalculator(tokenLP)
				if (determineValues && state.selectedToken) state.tokenAmount = quoteCalc.calcTokenValue(state.currencyAmount)
			}
			
		}
		dispatchEvent(state)
	}

	function handleTokenChange(e) {
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN") state.tokenAmount = null
		else state.tokenAmount = e.detail.tokenAmount

		if (e.detail.selectedToken) state.selectedToken = e.detail.selectedToken

		if (determineValues && state.tokenAmount) state.currencyAmount = quoteCalc.calcCurrencyValue(state.tokenAmount) 
		dispatchEvent(state)
	}

	const switchPositions = async () => {
		slots = slots.reverse()
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
    margin: 0.5rem 0;
  }


</style>

<div class="panel-container">
	<slot name="header"></slot>
	<InputCurrency 
		label={'Base'}
		on:input={handleCurrencyChange}
		{...state}
	/>
	
	<div class="plus-sign">
		<IconPlusSign width={"20px"} height={"50px"} />
	</div>

	<InputToken 
		label={'Token'}
		on:input={handleTokenChange} 
		{...state}
	/>
	<slot name="footer"></slot>
</div>
