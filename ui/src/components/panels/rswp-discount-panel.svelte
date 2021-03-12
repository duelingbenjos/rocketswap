<script>
    import { getContext } from 'svelte'
    //Icons 
    import FuelTankIcon from '../../icons/fuel-tank.svelte'
    import RocketswapIcon from '../../icons/rocketswap-logo.svelte'

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { rswpStakingInfo, token_list_store } from "../../store"  
    import { config } from "../../config" 

    const { rswpToken } = getContext('rswpContext')

    let tankPercent = 20

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
        height: 364px;
        padding: 20px;
        background: var(--panel-background-gradient);
        margin: 0;
    }
    .header{
        margin-bottom: 0;
    }
    .fuel-tank-icon{
        position: relative;
    }
    .rocketswap-icon{
        position: absolute;
        top: 12px;
        left: 25px;
    }
    .buttons{
        margin-top: 1rem;
    }
    .buttons > button{
        margin: 0 4px;
    }
    button.outline{
        color: var(--color-white);
    }
    .text-massive{
        margin: 0rem auto 0;
    }
    .staked{
        margin-bottom: 0;
        
    }
    .text-shadow{
        text-shadow: 1px 1px var(--fuel-tank-text-shadow);
    }
</style>

{#if $rswpToken}
    <div 
        class="flex-col panel-container text-small" 
        style={`
            background: 
                linear-gradient(0deg, var(--fuel-tank-panel-fuel-bg-color) ${tankPercent}%, rgba(255,255,255,0) ${tankPercent}%),
                var(--panel-background-gradient);
        `}>
        <div class="flex flex-center-center header">
            <div class="fuel-tank-icon">
                <FuelTankIcon width="75px" color="var(--text-primary-color)"/>
                <div class="rocketswap-icon">
                    <RocketswapIcon width="25px" color="var(--text-primary-color-inverted)"/>
                </div>
            </div>
        </div>
        <span>Current Trade Fee Discount:</span>  
        <span class="text-massive weight-600">0%</span>

        <div class="flex-grow flex-col flex-justify-spacearound">
            <div class="staked flex-row">
                <span class="flex-grow">Staked:</span>
                <span class="weight-600">0 <strong class="text-shadow text-color-secondary">{config.ammTokenSymbol}</strong></span>
            </div>
            <InputSpecific on:input={handleInput} tokenInfo={$rswpToken} {getStampCost} small={true}/>
            <div class="flex-row flex-center-center buttons">
                <button class="text-color-white primary ">FILL</button>
                <button class="primary outline">EMPTY</button>
            </div>
        </div>
    </div>
{/if}