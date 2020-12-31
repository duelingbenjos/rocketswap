<script lang="ts">
	import { createEventDispatcher, afterUpdate } from 'svelte'

	//Router
  	import { active } from 'svelte-hash-router'

	//Components
	import InputCurrency from './misc/input-currency.svelte'
	import InputToken from './misc/input-token.svelte'
	import Quote from './quote.svelte'
	import PoolButtons from './pool-buttons.svelte'
	import IconPlusSign from '../icons/plus-sign.svelte'

	//Misc
	import { calcRatios, toBigNumber } from '../utils'

	//Props
	export let pageState

	$: ratios = calcRatios(pageState?.tokenLP?.reserves)

	const dispatch = createEventDispatcher();

	let state = {};

	let slots = [
		{
			component: InputCurrency,
			handleInput: handleCurrencyChange,
			label: 'Currency'
		},
		{
			component: InputToken,
			handleInput: handleTokenChange,
			label: 'Token'
		},
	]

	afterUpdate(() => {
		state.selectedToken = pageState.selectedToken
	})

	function handleCurrencyChange(e){
		state.currencyAmount = toBigNumber(e.detail)
		state.tokenAmount = state.currencyAmount.dividedBy(ratios.token)
		dispatchEvent()
	}

	function handleTokenChange(e) {
		state.selectedToken = e.detail.selectedToken
		state.tokenAmount = parseFloat(e.detail.tokenAmount)
		dispatchEvent()
	}

	const switchPositions = async () => {
		slots = slots.reverse()
	}

	const dispatchEvent = () => dispatch('infoUpdate', state)
</script>

<style>
  .panel-container {
    margin: 0 auto;
    margin-top: 15px;
    padding: 30px;
    background-color: #875dd6;
    color: #fff;
    width: 380px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
  }

  .plus-sign{
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 1rem 0;
  }

  @media screen and (max-width: 800px) {
    .panel-container {
      margin: 0;
      height: 100%;
      width: 100%;
      border-radius: 0px;
    }

  }
</style>

<div class="panel-container">
	<slot name="header"></slot>
	<svelte:component 
		this={slots[0].component} 
		label={slots[0].label} 
		on:input={slots[0].handleInput} 
		{...state}
	/>
	
	<div class="plus-sign">
		<IconPlusSign width={"20"} height={"20"}/>
	</div>

	<svelte:component 
		this={slots[1].component} 
		label={slots[1].label} 
		on:input={slots[1].handleInput} 
		{...state}
	/>
	<slot name="footer"></slot>
</div>
