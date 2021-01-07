<script lang="ts">
	import { createEventDispatcher, afterUpdate } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	//Icons
	import LamdenLogo from '../../icons/lamden-logo.svelte'

	//Stores
	import { walletBalance } from '../../store'

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumber } from '../../utils.js'

	//Props
	export let label
	export let currencyAmount;

	const dispatch = createEventDispatcher();
	let inputElm;

	$: inputValue = currencyAmount;

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value)
			dispatchEvent(value)
		}
	}

	const handleMaxInput = () => {
		inputValue = $walletBalance
		inputElm.value = inputValue.toString()
		dispatchEvent(inputValue)
	}
	
	const dispatchEvent = (value) => dispatch('input', value)
</script>

<style>
	button.primary.small{
		margin-right: 6px;
	}
</style>

<div class="input-container flex-col"
	 in:scale="{{duration: 300, delay: 0, opacity: 0.5, start: 0.6, easing: quintOut}}">
	<div class="input-row-1 flex-row">
		<div class="input-label">
			{label}
		</div>
		<span class="number text-small">
			{`Balance: ${stringToFixed($walletBalance, 8)}`}
		</span>
	</div>
	<div class="input-row-2 flex-row">
	    <input 
			class="input-amount-value number"
			placeholder="0.0" 
			value={inputValue ? inputValue.isNaN() ? "" : inputValue?.toString() : ""} 
			bind:this={inputElm}
			type="text"
			on:input={handleInputChange}
        />

		<div class="input-controls">
			{#if !inputElm?.value}
				<button on:click={handleMaxInput} class="primary small">MAX</button> 
			{/if}
			<LamdenLogo width="23px" margin="0 3px 0 0" color="white"/>
			<span class="input-token-label text-xlarge"> {config.currencySymbol} </span>
		</div>
	</div>
</div>