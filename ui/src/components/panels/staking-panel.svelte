<script>
    import { setContext } from 'svelte'
    
    //Icons 
    import YieldLogo from '../../icons/yield-logo.svelte'


    // Components
    import InputSpecific from '../inputs/input-specific.svelte'
    import ConfirmStakingToken from '../confirms/confirm-staking-stake.svelte'
    import ConfirmRemoveStake from '../confirms/confirm-staking-remove.svelte'
    import Modal from '../misc/modal.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { rswpStakingDeposits, rswpStakingWithdrawls } from "../../store"  
    import { toBigNumberPrecision, toBigNumber, stakingCalculator } from "../../utils"  

    setContext('stakingPanelContext', {
		getStampCost
	});

    export let stakingInfo;

    let stakingAmount = toBigNumber("0");
    let loading = false;
    let showStakingConfirm = false;
    let showRemoveStakeConfirm = false;

    $: deposits = $rswpStakingDeposits[stakingInfo?.contract_name] || [];
    $: withdrawAmount = $rswpStakingWithdrawls[stakingInfo?.contract_name] || toBigNumber("0");
    $: stakingToken = stakingInfo?.staking_token || null
    $: yieldToken = stakingInfo?.yield_token || null
    $: hasBothTokens = yieldToken && stakingToken;
    $: validStakingAmount = stakingAmount.isGreaterThan(0);
    

    $: stakingCalcs = stakingCalculator(stakingInfo, deposits, withdrawAmount);
    $: hasStake = stakingCalcs?.stakedAmount?.isGreaterThan(0) || false;
    $: EmissionRatePerYear = stakingInfo?.EmissionRatePerHour.multipliedBy(24).multipliedBy(365);

    $: log = console.log({
        deposits, 
        withdrawAmount, 
        stakingToken, 
        yieldToken, 
        hasBothTokens, 
        validStakingAmount, 
        stakingCalcs, 
        EmissionRatePerYear
    })

    async function getStampCost(contract, method){
		let txList = [
			{contract, method}
		]
		return await walletService.estimateTxCosts(txList)
    }

    const handleInput = (e) => {
        stakingAmount = toBigNumberPrecision(e.detail, 8)
        //console.log({e: e.detail, stakingAmount, validStakingAmount})
    }

    const openStakingConfirm = () => showStakingConfirm = true

    const toggleStakingConfirm = () => {
        if (showStakingConfirm) showStakingConfirm = false
        else showStakingConfirm = true
    }

    const openRemoveStakingConfirm = () => showRemoveStakeConfirm = true

    const toggleRemoveStakingConfirm = () => {
        if (showRemoveStakeConfirm) showRemoveStakeConfirm = false
        else showRemoveStakeConfirm = true
    }
</script>

<style>
    .panel-container{
        max-width: 300px;
        min-width: 280px;
        padding: 20px;
        margin: 10px 0;

        border-radius: 32px;
        background: var(--panel-background-gradient);

        box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
    }
    .header{
        position: relative;
        margin-bottom: 1rem;
    }
    .symbols{
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        margin-bottom: -1rem;
        z-index: 1;
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
        margin: 0.5rem 0 0;
    }
    .staked{
        margin: 0.5rem 0;
    }

    @media screen and (min-width: 430px) {
        .panel-container{
            margin: 10px;
        }
    }

</style>

{#if hasBothTokens}
    <div class="panel-container text-small">
        <div class="flex-col flex-center-center header ">
            <span class="symbols weight-600 text-large">{`${stakingToken.token_symbol} - ${yieldToken.token_symbol}`}</span>
            <YieldLogo {yieldToken} {stakingToken} />
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
                <span class="flex-grow ">Earned:</span>
                <div class="flex-row">
                    <span class="flex-grow text-primary-dimmer">{stakingInfo.EmissionRatePerHour}</span>
                    <strong class="symbol text-color-secondary">{yieldToken.token_symbol}</strong>
                    <button class="primary small" disabled={loading}>WITHDRAW</button>
                </div>
            </div>
            <div class="flex-row staked">
                <span class="flex-grow ">Staked:</span>
                <div class="flex-row">
                    <span class="flex-grow text-primary-dimmer">{toBigNumberPrecision(stakingCalcs.stakedAmount, 8)}</span>
                    <strong class="symbol text-color-secondary">{stakingToken.token_symbol}</strong>
                </div>
            </div>

        </div>
        <InputSpecific on:input={handleInput} tokenInfo={stakingToken} {getStampCost} small={true}/>
        <div class="flex-row flex-center-center buttons">
            <button class="primary" on:click={openStakingConfirm} disabled={loading || !validStakingAmount}>STAKE</button>
            <button class="primary outline" on:click={openRemoveStakingConfirm} disabled={loading || !hasStake}>REMOVE STAKE</button>
        </div>
    </div>
{/if}

{#if showStakingConfirm && hasBothTokens && validStakingAmount}
    <Modal toggleModal={toggleStakingConfirm} open={openStakingConfirm}>
        <div slot="main">
            <ConfirmStakingToken 
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
                closeConfirm={toggleStakingConfirm} 
                {stakingAmount} />
        </div>
    </Modal>
{/if}

{#if showRemoveStakeConfirm}
    <Modal toggleModal={toggleRemoveStakingConfirm} open={openRemoveStakingConfirm}>
        <div slot="main">
            <ConfirmRemoveStake 
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
                closeConfirm={toggleRemoveStakingConfirm} 
                stakedAmount={stakingCalcs.stakedAmount}  />
        </div>
    </Modal>
{/if}