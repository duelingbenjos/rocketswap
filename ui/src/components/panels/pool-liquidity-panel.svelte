<script lang="ts">
	import { getContext } from 'svelte'

	//Components
	import InputCurrency from '../inputs/input-currency.svelte'
	import InputToken from '../inputs/input-token.svelte'
	import Tooltip from '../misc/tooltip.svelte'
	import IconPlusSign from '../../icons/plus-sign.svelte'

	// Icons
	import VerifiedToken from '../../icons/verified_token.svelte'

	//Misc
	import { quoteCalculator, toBigNumber, stringToFixed } from '../../utils'

	const { determineValues, pageStores, saveStoreValue } = getContext('pageContext')
	const { selectedToken, tokenAmount, currencyAmount, tokenLP, isVerified } = pageStores

	let tooltip = ["Rocketswap Verified Token Contract"]

	$: quoteCalc = quoteCalculator($tokenLP);

	function handleCurrencyChange(e){
		if (e.detail.toString() === "NaN") saveStoreValue(currencyAmount, null)
		else{
			saveStoreValue(currencyAmount, toBigNumber(stringToFixed(e.detail, 8)))
			if ($tokenLP && determineValues && $selectedToken) saveStoreValue(tokenAmount, toBigNumber(stringToFixed(quoteCalc.calcTokenValue($currencyAmount), 8)))
		}
	}

	function handleTokenChange(e) {
		if (!e.detail.tokenAmount || e.detail.tokenAmount?.toString() === "NaN") saveStoreValue(tokenAmount, null)
		else saveStoreValue(tokenAmount, e.detail.tokenAmount)

		if (e.detail.selected) saveStoreValue(selectedToken, e.detail.selected)
		if ($tokenLP && determineValues && $tokenAmount) {
			saveStoreValue(currencyAmount, toBigNumber(stringToFixed(quoteCalc.calcCurrencyValue($tokenAmount), 8)))
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
  .verified-token-legend{
		position: absolute;
		top: 20px;
		left: -5px;
		width: 50px;
		transform: translateY(-50%);
		z-index: 2;
    }

	@media screen and (min-width: 430px) {
		.verified-token-legend{
			transform: translate(-42%, -67%);
			width: 75px;
		}
	}

</style>

<div class="panel-container">
	{#if $isVerified}
		<div class="verified-token-legend flex row">
			<Tooltip icon={VerifiedToken} width="100%" {tooltip}/>
		</div>
	{/if}
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
