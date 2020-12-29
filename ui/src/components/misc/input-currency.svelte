<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	//Stores
	import { wallet_store } from '../../store'

	//Misc
	import { config } from '../../config'
	import { stringToFixed } from '../../utils.js'

	//Props
	export let label
	export let currencyAmount;

	const dispatch = createEventDispatcher();
	

	$: walletBalance = !$wallet_store.init ? $wallet_store.balance.toString() : "0";

	const handleInputChange = () => {
		if (currencyAmount > walletBalance) handleMaxInput()
		else{
			dispatchEvent()
		}
	}

	const handleMaxInput = () => {
		currencyAmount = walletBalance
		dispatchEvent()
	}
	
	const dispatchEvent = () => dispatch('input', currencyAmount)
</script>

<div class="input-container flex-col"
	 in:scale="{{duration: 500, delay: 0, opacity: 0.5, start: 0.5, easing: quintOut}}">
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
			placeholder="0" 
			bind:value={currencyAmount} 
			type="number"
			on:input={handleInputChange}
        />

		<div class="input-controls">
		<button on:click={handleMaxInput} class="max-button">MAX</button> 
		<span class="token-label"> {config.currencySymbol} </span>
		</div>
	</div>
</div>