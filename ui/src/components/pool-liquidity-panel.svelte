<script lang="ts">
	import { getContext } from 'svelte'

	//Components
	import InputCurrency from './misc/input-currency.svelte'
	import InputToken from './misc/input-token.svelte'
	import Buttons from './buttons.svelte'
	import IconPlusSign from '../icons/plus-sign.svelte'

	//Misc
	import { quoteCalculator, toBigNumber, stringToFixed } from '../utils'

	const { determineValues, pageStores, saveStoreValue } = getContext('pageContext')
	const { selectedToken, tokenAmount, currencyAmount, tokenLP } = pageStores

	$: quoteCalc = quoteCalculator($tokenLP);

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN") saveStoreValue(currencyAmount, null)
		else{
			saveStoreValue(currencyAmount, e.detail)
			if ($tokenLP && determineValues && $selectedToken) $tokenAmount = quoteCalc.calcTokenValue($currencyAmount)
		}
	}

	function handleTokenChange(e) {
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN") saveStoreValue(tokenAmount, null)
		else saveStoreValue(tokenAmount, e.detail.tokenAmount)

		if (e.detail.selected) saveStoreValue(selectedToken, e.detail.selected)
		if ($tokenLP && determineValues && $tokenAmount) {
			saveStoreValue(currencyAmount, quoteCalc.calcCurrencyValue($tokenAmount))
		}
	}
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
	/>
	
	<div class="plus-sign">
		<IconPlusSign width={"20px"}  />
	</div>

	<InputToken 
		label={'Token'}
		on:input={handleTokenChange} 
	/>
	<slot name="footer"></slot>
</div>
