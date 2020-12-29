<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	//Components
	import TokenSelect from './token-select-toggle.svelte'

	//Stores
	import { wallet_store } from '../../store'

	//Misc
	import { config } from '../../config'
	import { stringToFixed } from '../../utils.js'

	//Props
	export let label
	export let tokenAmount;
	export let selectedToken;

	const dispatch = createEventDispatcher();

	$: wallet_balance = !$wallet_store.init ? $wallet_store.balance.toString() : "0";
	$: tokenBalance = selectedToken?.balance;

	const handleInputChange = () => {
		if (tokenAmount > tokenBalance) handleMaxInput()
		else{
			dispatchEvent()
		}
	}

	const handleMaxInput = () => {
		tokenAmount = selectedToken.balance.toFixed(8);
		dispatchEvent()
	}

	const handleTokenSelect = (e) => {
		selectedToken = e.detail
		handleMaxInput();
		dispatchEvent()
	}

	const dispatchEvent = () => dispatch('input', {tokenAmount, selectedToken})
</script>

<div class="input-container flex-col"
	 in:scale="{{duration: 500, delay: 0, opacity: 0.5, start: 0.5, easing: quintOut}}">
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
			placeholder="0" 
			bind:value={tokenAmount} 
			type="number" 
			on:input={handleInputChange}
			disabled={!selectedToken} 
		/>
		<div class="input-controls">
			{#if selectedToken}
				<button on:click={handleMaxInput} class="max-button">MAX</button>
			{/if}
			<TokenSelect on:selected={handleTokenSelect} {selectedToken}/>
		</div>
	</div>
</div>
