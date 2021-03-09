<script>
    //Emission Rate

    // Staked tokens create a deposit hash (vk key)
    // value of that is an array

    // open for business (cannot deposit if false)

    // How much they have earned
    // What the APY (Average Percentage Yeild)
    // - 

    // Token logo
    // Symbols
    // APY / HPY
    // Gather "havest"

    import { setContext } from 'svelte'
    
    //Icons 
    import YeildLogo from '../../icons/yeild-logo.svelte'
    import CurrencyLogo from '../../icons/lamden-logo.svelte'

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { rswpStakingInfo, token_list_store } from "../../store"  
    import { currencyToken } from "../../config" 

    currencyToken.logo_component = CurrencyLogo

    setContext('stakingPanelContext', {
		getStampCost
	});

    export let stakingInfo;

    $: stakingToken = determineTokenInfo('staking', stakingInfo);
    $: yeildToken = determineTokenInfo('yeild', stakingInfo);
    $: hasBothTokens = yeildToken && stakingToken
    $: log = console.log({stakingToken, yeildToken, hasBothTokens, rswpStakingInfo: stakingInfo})

    $: EmissionRatePerYear = stakingInfo?.EmissionRatePerHour.multipliedBy(24).multipliedBy(365);

    const determineTokenInfo = (type, stakingInfo) => {
        if (!stakingInfo) return null
        if (type === 'yeild'){
            console.log({type, yeild_token: stakingInfo.yeild_token, YIELD_TOKEN: stakingInfo.meta.YIELD_TOKEN})
            if (stakingInfo.yeild_token) return stakingInfo.yeild_token
            if (stakingInfo.meta.YIELD_TOKEN === "currency") return currencyToken
        }
        if (type === 'staking'){
             console.log({type, yeild_token: stakingInfo.staking_token, STAKING_TOKEN: stakingInfo.meta.STAKING_TOKEN})
            if (stakingInfo.staking_token) return stakingInfo.staking_token
            if (stakingInfo.meta.STAKING_TOKEN === "currency") return currencyToken
        }
        return null
    }

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
    .symbol{
        margin-left: 4px;
    }
    .buttons{
        margin-top: 1rem;
    }
    .buttons > button{
        margin: 0 4px;
    }
    .earned{
        margin: 1rem 0;
    }

</style>

{#if hasBothTokens}
    <div class="panel-container text-small">
        <div class="flex flex-center-center header">
            <YeildLogo {yeildToken} {stakingToken} />
        </div>
        <div class="flex-row">
            <span class="flex-grow">Stake:</span>
            <span class="weight-600">{stakingToken.token_symbol}</span>
        </div>
        <div class="flex-row">
            <span class="flex-grow">Earn:</span>
            <span class="weight-600">{yeildToken.token_symbol}</span>
        </div>
        <div class="info">
            <div class="flex-row">
                <span class="flex-grow">APY:</span>
                <div class="flex-col flex-align-end ">
                    <span class="weight-600">{EmissionRatePerYear}</span>
                    <span class="text-primary-dimmer">{stakingInfo.EmissionRatePerHour}/hour</span>
                </div>
            </div>

            <div class="flex-row earned">
                <span class="flex-grow "> Earned:</span>
                <div class="flex-row">
                    <span class="flex-grow text-primary-dimmer">{stakingInfo.EmissionRatePerHour}</span>
                    <strong class="symbol text-color-secondary">{yeildToken.token_symbol}</strong>
                    <button class="primary small">WITHDRAW</button>
                </div>
            </div>

        </div>
        <InputSpecific on:input={handleInput} tokenInfo={stakingToken} {getStampCost} small={true}/>
        <div class="flex-row flex-center-center buttons">
            <button class="primary">STAKE</button>
            <button class="primary outline">REMOVE STAKE</button>
        </div>
    </div>
{/if}