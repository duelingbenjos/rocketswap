<script lang="ts">
	import { createEventDispatcher, afterUpdate } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	//Stores
	import { wallet_store } from '../../store'

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumber } from '../../utils.js'

	//Props
	export let label
	export let currencyAmount;

	const dispatch = createEventDispatcher();
	let inputElm;

	$: walletBalance = !$wallet_store.init ? $wallet_store.balance : toBigNumber("0.0");
	$: inputValue = currencyAmount;

	afterUpdate(() => {currencyAmount, walletBalance, inputValue})

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value)
			if (value.isGreaterThan(walletBalance) ) handleMaxInput()
			else dispatchEvent(value)
		}
	}

	const handleMaxInput = () => {
		inputValue = walletBalance
		inputElm.value = inputValue.toString()
		dispatchEvent(inputValue)
	}
	
	const dispatchEvent = (value) => dispatch('input', value)
</script>

<div class="input-container flex-col"
	 in:scale="{{duration: 300, delay: 0, opacity: 0.5, start: 0.6, easing: quintOut}}">
	<div class="input-row-1 flex-row">
		<div class="input-label">
			{label}
		</div>
		<div class="input-balance">
			{walletBalance ? `Balance: ` : ''}
			<span class="number">
				{stringToFixed(walletBalance, 8)}
			</span>
		</div>
	</div>
	<div class="input-row-2 flex-row">
	    <input 
			class="input-amount-value number"
			placeholder="0.0" 
			value={inputValue?.toString() || ""} 
			bind:this={inputElm}
			type="text"
			on:input={handleInputChange}
        />

		<div class="input-controls">
		<button on:click={handleMaxInput} class="primary">MAX</button> 
		<span class="token-label"> {config.currencySymbol} </span>
		</div>
	</div>
</div>