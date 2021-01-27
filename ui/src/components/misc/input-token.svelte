<script lang="ts">
	import { createEventDispatcher, getContext, onDestroy } from 'svelte'
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {WsService} from '../../services/ws.service'

	//Components
	import TokenSelect from './token-select-toggle.svelte'

	//Icons
	import Base64Svg from '../../icons/base64_svg.svelte'

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumber } from '../../utils.js'
	import { tokenBalances } from '../../store'

	//Props
	export let label

	const dispatch = createEventDispatcher();
	const ws = WsService.getInstance()
	
	let { pageStores } = getContext('pageContext')
	const { selectedToken, tokenAmount } = pageStores

	let inputElm;

	$: tokenBalance = $selectedToken ? $tokenBalances[$selectedToken.contract_name] : toBigNumber("0.0")
	$: inputValue = $tokenAmount;

	onDestroy(()=>ws.leaveTradeFeed())

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
			dispatchEvent(value)
		}
	}

	const handleMaxInput = () => {
		inputValue = tokenBalance
		inputElm.value = inputValue.toString()
		dispatchEvent(inputValue)
	}

	const handleTokenSelect = (e) => {
		dispatchEvent(inputValue, e.detail)
		// Subscribe the LP feed / Trade Feed
		console.log(e.detail)
		ws.joinTradeFeed(e.detail.contract_name)
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
			type="text"
			disabled={!$selectedToken} 
		/>
		<div class="input-controls">
			{#if !inputElm?.value && $selectedToken}
				<button disabled={!$selectedToken} on:click={handleMaxInput} class="primary small">MAX</button>
			{/if}
			<TokenSelect on:selected={handleTokenSelect} />
		</div>
	</div>
</div>
