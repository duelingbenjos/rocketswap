<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';


	//Components
	import TokenSelect from './token-select-toggle.svelte'

	//Icons
	import Base64Svg from '../../icons/base64_svg.svelte'

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumber, determinePrecision } from '../../utils.js'
	import { tokenBalances } from '../../store'

	//Props
	export let label

	const dispatch = createEventDispatcher();
	
	let { pageStores } = getContext('pageContext')
	const { selectedToken, tokenAmount, buy } = pageStores

	let inputElm;
	let pressedMaxValue = false;

	$: tokenBalance = $selectedToken ? $tokenBalances[$selectedToken.contract_name] : toBigNumber("0.0")
	$: inputValue = $tokenAmount;

	tokenBalances.subscribe(val => console.log(val))

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
			if (determinePrecision(value) > 8){
				value = toBigNumber(stringToFixed(value.toString(), 8))
				inputElm.value = value.toString()
			}
			pressedMaxValue = false
			dispatchEvent(value)
		}
	}

	const handleMaxInput = () => {
		inputValue = tokenBalance
		inputElm.value = inputValue.toString()
		pressedMaxValue = true
		dispatchEvent(inputValue)
	}

	const handleTokenSelect = (e) => {
		pressedMaxValue = false
		dispatchEvent(inputValue, e.detail)
	}

	const dispatchEvent = (value, selected) => dispatch('input', {tokenAmount: value, selected})
</script>

<div class="input-container flex-col"
	 in:scale="{{duration: 300, delay: 0, opacity: 0.0, start: 0.6, easing: quintOut}}">
	<div class="input-row-1 flex-row">
		<div class="input-label">{label}</div>
		<div class="input-balance">
			{#if $selectedToken}
				Balance: 
				<span class="number text-small">{stringToFixed(tokenBalance, 8)}</span>
			{/if}
		</div>
	</div>
	<div class="input-row-2 flex-row">
		<input 
			class="input-amount-value number"
			placeholder="0.0" 
			value={inputValue?.toString() || ""}
			bind:this={inputElm} 
			on:input={handleInputChange}
			disabled={!$selectedToken} 
		/>
		<div class="input-controls">
			{#if $buy === false && $selectedToken && !pressedMaxValue}
				<button disabled={!$selectedToken} on:click={handleMaxInput} class="primary small">MAX</button>
			{/if}
			<TokenSelect on:selected={handleTokenSelect} />
		</div>
	</div>
</div>
