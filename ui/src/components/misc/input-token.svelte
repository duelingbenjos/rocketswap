<script lang="ts">
	import { createEventDispatcher, afterUpdate } from 'svelte'
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

	$: wallet_balance = !$wallet_store.init ? $wallet_store.balance.toString() : toBigNumber("0.0");
	$: tokenBalance = selectedToken?.balance ? toBigNumber(selectedToken?.balance) : toBigNumber("0.0");
	$: bigNumber = tokenAmount ? toBigNumber(tokenAmount) : toBigNumber("0.0")

	afterUpdate(() => console.log({tokenAmount}))

	const handleInputChange = () => {
		if (toBigNumber(tokenAmount).isGreaterThan(tokenBalance)) handleMaxInput()
		dispatchEvent()
	}

	const handleMaxInput = () => {
		tokenAmount = tokenBalance.toString();
		dispatchEvent()
	}

	const handleTokenSelect = (e) => {
		selectedToken = e.detail
		handleMaxInput();
		dispatchEvent()
	}

	const dispatchEvent = () => dispatch('input', {tokenAmount: bigNumber, selectedToken})
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
			bind:value={tokenAmount} 
			on:input={handleInputChange}
			type="text"
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
