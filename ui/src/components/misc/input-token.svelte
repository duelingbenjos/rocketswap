<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	//Components
	import TokenSelect from './token-select-toggle.svelte'

	//Stores
	import { wallet_store } from '../../store'

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumber } from '../../utils.js'

	//Props
	export let label
	export let tokenAmount;
	export let selectedToken;

	const dispatch = createEventDispatcher();
	let inputElm;

	$: wallet_balance = !$wallet_store.init ? $wallet_store.balance.toString() : toBigNumber("0.0");
	$: tokenBalance = selectedToken?.balance ? toBigNumber(selectedToken?.balance) : toBigNumber("0.0");
	$: inputValue = tokenAmount;

	//afterUpdate(() => console.log({tokenAmount}))

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
			if (value.isGreaterThan(tokenBalance) ) handleMaxInput()
			else {
				dispatchEvent(value)
			}
		}
	}

	const handleMaxInput = () => {
		inputValue = tokenBalance
		inputElm.value = inputValue.toString()
		dispatchEvent(inputValue)
	}

	const handleTokenSelect = (e) => {
		selectedToken = e.detail
		console.log(e.detail)
		handleMaxInput();
		dispatchEvent(toBigNumber(selectedToken.balance))
	}

	const dispatchEvent = (value) => dispatch('input', {tokenAmount: value, selectedToken})
</script>

<div class="input-container flex-col"
	 in:scale="{{duration: 300, delay: 0, opacity: 0.0, start: 0.6, easing: quintOut}}">
	<div class="input-row-1 flex-row">
		<div class="label">{label}</div>
		<div class="input-balance">
			{#if selectedToken}
				Balance: 
				<span class="number">{stringToFixed(tokenBalance, 8)}</span>
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
			type="text"
			disabled={!selectedToken} 
		/>
		<div class="input-controls">
			{#if selectedToken}
				<button on:click={handleMaxInput} class="max-button">MAX</button>
			{/if}
			<TokenSelect on:selected={handleTokenSelect} {selectedToken} />
		</div>
	</div>
</div>
