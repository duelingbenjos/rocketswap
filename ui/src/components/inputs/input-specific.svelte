<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    
    // Icons
    import TokenLogo from '../../icons/token-logo.svelte'

	//Stores
	import { tokenBalances } from '../../store'

	//Services
	//import { WalletService } from '../../services/wallet.service'
	//const walletService = WalletService.getInstance();

	//Misc
	import { config } from '../../config'
	import { stringToFixed, toBigNumberPrecision, toBigNumber, determinePrecision, stampsToTAU } from '../../utils.js'

	//Props
    export let label = null
    export let tokenInfo
    export let getStampCost
	export let small = false;
	export let short = false;

	const dispatch = createEventDispatcher();

	let inputElm;
	let pressedMaxValue = false;

    $: inputValue = null;
    $: balance = $tokenBalances[tokenInfo.contract_name] ? $tokenBalances[tokenInfo.contract_name] : toBigNumber("0");

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value)
			if (determinePrecision(value) > 8){
				value = toBigNumber(stringToFixed(value, 8))
				inputElm.value = stringToFixed(value, 8)
			}
			pressedMaxValue = false;
			dispatchEvent(value)
		}
	}

	const handleMaxInput = async () => {
        let adjustedValue = 0;
        
        if (tokenInfo.contract_name === "currency"){
            let txTAUCost = stampsToTAU(await getStampCost())
            if (balance.isGreaterThan(txTAUCost)){
                adjustedValue = balance.minus(toBigNumber(txTAUCost))
                inputValue = toBigNumberPrecision(adjustedValue, 8)
            }
        }

		inputElm.value = stringToFixed(inputValue, 8)
		pressedMaxValue = true;
		dispatchEvent(inputValue)
	}
	
	const dispatchEvent = (value) => dispatch('input', value)
</script>

<style>
	button.primary.small{
		margin-right: 6px;
	}

	.input-container {
  		position: relative;
  	}
	.input-container.short{
		max-width: 230px;
		border: 0;
		margin: 0;
	}
</style>

<div class="input-container flex-col" class:small={small} class:short={short}>
	<div class="input-row-1 flex-row " class:small={small}>
        {#if label}
            <div class="input-label text-primary">
                {label}
            </div>
        {/if}
		<span class="text-small">Balance:</span>
        <span class="text-small">{toBigNumberPrecision(balance, 8)}</span>
	</div>
	<div class="input-row-2 flex-row " class:small={small}>
	    <input 
			class="input-amount-value"
            class:small={small}
			placeholder="0.0" 
			value={inputValue ? inputValue.isNaN() ? "" : stringToFixed(inputValue, 8) : ""} 
			bind:this={inputElm}
			on:input={handleInputChange}
        />

		<div class="input-controls">
        	{#if !pressedMaxValue}
				<button on:click={handleMaxInput} class="primary small">MAX</button> 
			{/if}
			<TokenLogo tokenMeta={tokenInfo} width={small ? "20px" : "23px"} margin="0 3px 0 0" />
			<span class="input-token-label text-xlarge" class:small={small}> {tokenInfo.token_symbol} </span>
		</div>
	</div>
</div>