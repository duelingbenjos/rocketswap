<script>
    import { getContext } from 'svelte'
    //Icons 

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { rswpStakingInfo, token_list_store } from "../../store"  
    import { config } from "../../config" 

    const { rswpToken } = getContext('rswpContext')

    async function getStampCost(contract, method){
		let txList = [
			{contract, method}
		]
		return await walletService.estimateTxCosts(txList)
    }
    
    const handleInput = (e) => {
        console.log(e)
    }
</script>

<style>
    .panel-container{
        max-width: 300px;
        padding: 20px;
    }
    .header{
        margin-bottom: 2rem;
    }
    .buttons{
        margin-top: 1rem;
    }
    .buttons > button{
        margin: 0 4px;
    }
    .text-massive{
        margin: 1rem auto 0;
    }
    .staked{
        margin-bottom: 1rem;
    }
</style>

{#if $rswpToken}
    <div class="flex-col panel-container text-small">
        <div class="flex flex-center-center header">
            Trade Fee Discount
        </div>
        <span>Current Discount:</span>  
        <span class="text-massive weight-600">0%</span>

        <div class="flex-grow flex-col flex-justify-end">
            <div class="staked flex-row">
                <span class="flex-grow">Staked:</span>
                <span class="weight-600">0 <strong class="text-color-secondary">{config.ammTokenSymbol}</strong></span>
            </div>
            <InputSpecific on:input={handleInput} tokenInfo={$rswpToken} {getStampCost} small={true}/>
            <div class="flex-row flex-center-center buttons">
                <button class="primary">STAKE</button>
                <button class="primary outline">REMOVE STAKE</button>
            </div>
        </div>
    </div>
{/if}