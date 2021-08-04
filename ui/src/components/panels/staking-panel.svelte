<script>
    import { setContext, onDestroy } from 'svelte'
    import { fade } from 'svelte/transition';
    
    //Icons 
    import HelpFilled from '../../icons/help-filled.svelte'
    import InfoIcon from '../../icons/info.svelte'

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'
    import ConfirmStakingToken from '../confirms/confirm-staking-stake.svelte'
    import ConfirmRemoveStake from '../confirms/confirm-staking-remove.svelte'
    import ConfirmWithdrawStake from '../confirms/confirm-staking-withdraw.svelte'
    import ConfirmCompoundStake from '../confirms/confirm-staking-compound.svelte'
    import Modal from '../misc/modal.svelte'
    import TimeBanner from './time-banner.svelte'
    import StakingPanelHeader from '../misc/staking-panel-header.svelte'
    import StakingPanelInfo from './staking-panel-info.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { userYieldInfo, tabHidden } from "../../store"  
    import { toBigNumberPrecision, toBigNumber, stakingCalculator, stringToFixed } from "../../utils"  
    import { config } from "../../config"  

    setContext('stakingPanelContext', {
		getStampCost
	});

    export let stakingInfo;

    let stakingAmount = toBigNumber("0");
    let loading = false;
    let showStakingConfirm = false;
    let showRemoveStakeConfirm = false;
    let showWithdrawStakeConfirm = false;
    let showCompoundStakeConfirm = false;
    let clearInput
    let timer_yieldUpdate = null;

    let showInfo = false;

    //$: log = console.log({stakingInfo})
    $: stakingCalcs = stakingCalculator(stakingInfo);

    $: userYield = $userYieldInfo[stakingInfo?.contract_name];
    $: totalStaked = userYield ? userYield.total_staked : toBigNumber("0");
    $: additionalYield = userYield ? stakingCalcs.calcNewYeild(userYield) : toBigNumber("0");
    $: currentYield = userYield ? userYield.current_yield?.plus(additionalYield) : toBigNumber("0");
    $: rewardRate = userYield ? userYield.user_reward_rate : toBigNumber("0")
    $: hasStake = totalStaked?.isGreaterThan(0) || false;
    $: startTimer = !startTimer && currentYield.isGreaterThan(0) ? startUpdater() : null;

    $: stakingToken = stakingInfo?.staking_token || null;
    $: yieldToken = stakingInfo?.yield_token || null;
    $: hasBothTokens = yieldToken && stakingToken;
    $: stakingContractType = stakingInfo ? stakingInfo.meta.type : null;
    $: isLpToken = stakingContractType === "liquidity_mining_smart_epoch"
    $: showCompoundButton = shouldShowCompoundButton(yieldToken, currentYield, stakingContractType, totalStaked)
    $: useTimeRamp = stakingInfo?.UseTimeRamp ? stakingInfo.UseTimeRamp : false;
    $: validStakingAmount = stakingAmount.isGreaterThan(0);
    $: stakingDisabled = !stakingInfo?.OpenForBusiness

    onDestroy(() => {
       clearInterval(startTimer)
       startTimer = null
    })

    const startUpdater = () => {
        "!!!STARTING TIMER!!!"
        if (!timer_yieldUpdate) timer_yieldUpdate = setInterval(updateYeild, 3000)
    }
    
    const updateYeild = () =>{
        if (!$tabHidden) additionalYield = stakingCalcs.calcNewYeild(userYield)
    }

    async function getStampCost(contract, method){
		let txList = [
			{contract, method}
		]
		return await walletService.estimateTxCosts(txList)
    }


    const shouldShowCompoundButton = (yieldToken, currentYield, stakingContractType) => {
        let stakingTokenName = stakingToken?.contract_name
        let yieldTokenName = yieldToken?.contract_name

        if (!yieldToken || !stakingContractType) return false
        if (!stakingInfo.OpenForBusiness) return false
        if (currentYield.isLessThanOrEqualTo(0)) return false
        if (stakingInfo.meta.type === "staking_smart_epoch_compounding_timeramp" && stakingTokenName === yieldTokenName) return true
        if (stakingInfo.meta.type === "staking_smart_epoch" && stakingTokenName === yieldTokenName) return true
        if (stakingInfo.meta.type === "staking_smart_epoch_compounding" && stakingTokenName === yieldTokenName) return true
        if (yieldToken.contract_name === config.ammTokenContract) {
                return true
        }
        return false
    }

    const handleInput = (e) => {
        stakingAmount = toBigNumberPrecision(e.detail, 8)
    }

    const openStakingConfirm = () => toggleStakingConfirm(true)
    const toggleStakingConfirm = (e, force = null) => {
        if (force === null){
            if (showStakingConfirm) showStakingConfirm = false
            else showStakingConfirm = true
        }else{
            showStakingConfirm = force;
        }
    }

    const openRemoveStakingConfirm = () => toggleRemoveStakingConfirm(true)
    const toggleRemoveStakingConfirm = (e, force = null) => {
        if (force === null){
            if (showRemoveStakeConfirm) showRemoveStakeConfirm = false
            else showRemoveStakeConfirm = true
        }else{
            showRemoveStakeConfirm = force;
        }
    }

    const openWithdrawStakingConfirm = () => toggleWithdrawStakingConfirm(true)
    const toggleWithdrawStakingConfirm = (e, force = null) => {
        if (force === null){
            if (showWithdrawStakeConfirm) showWithdrawStakeConfirm = false
            else showWithdrawStakeConfirm = true
        }else{
            showWithdrawStakeConfirm = force;
        }
    }

    const openCompoundStakingConfirm = () => toggleCompoundStakingConfirm(true)
    const toggleCompoundStakingConfirm = (e, force = null) => {
        if (force === null){
            if (showCompoundStakeConfirm) showCompoundStakeConfirm = false
            else showCompoundStakeConfirm = true
        }else{
            showCompoundStakeConfirm = force;
        }
    }

    const toggleInfo = () => showInfo = !showInfo;
</script>

<style>
    .panel-container{
        position: relative;
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
    .symbol{
        margin-left: 4px;
    }
    .info-icon{
        position: absolute;
        top: 13px;
        right: 13px;
        cursor: pointer;
        z-index: 1;
    }
    .buttons{
        margin-top: 1rem;
    }
    .buttons > button{
        margin: 0 4px;
    }
    button.primary.small{
        margin: 0;
    }
    .withdraw-button{
        min-height: 20px;
    }
    .info{
        margin: 1rem 0;
    }
    @media screen and (min-width: 430px) {
        .panel-container{
            margin: 10px;
        }
    }

</style>

{#if hasBothTokens}
    <div class="panel-container text-small">
        <div class="info-icon" on:click={toggleInfo}>
        <InfoIcon color={"var(--text-color-highlight)"}/>
        </div>
        <StakingPanelHeader {yieldToken} {stakingToken} {stakingContractType}/>

        {#if showInfo}
            <StakingPanelInfo {toggleInfo} {stakingInfo} {yieldToken} {stakingToken} {stakingContractType}/>
        {:else}
            <div class="time-banner">
                <TimeBanner startTime={stakingInfo.StartTime.__time__} endTime={stakingInfo.EndTime.__time__} />
            </div>
            <div class="info" in:fade>
                <div class="flex-row">
                    <span class="flex-grow">Annual Percentage Yield:</span>
                    <div class="flex-col flex-align-end ">
                        <span class="weight-600">{stakingCalcs.emissionRatePerYear} %</span>
                        <!-- <span class="text-primary-dimmer">{stringToFixed(stakingInfo.EmissionRatePerHour, 8)}/hour</span> -->
                    </div>
                </div>

                <div class="flex-row earned">
                    <span class="flex-grow ">Earned:</span>
                    <div class="flex-row">
                        <span class="flex-grow text-primary-dimmer">{stringToFixed(currentYield, 8)}</span>
                        <strong class="symbol text-color-secondary">{yieldToken.token_symbol}</strong>
                    </div>
                </div>
                {#if currentYield.isGreaterThan(0)}
                    <div class="flex-row flex-center-end">
                        <div class="withdraw-button flex flex-justify-end">
                            {#if showCompoundButton}
                                <button 
                                    class="margin-0 outline small squared" 
                                    style="margin-right: 3px;"
                                    on:click={openCompoundStakingConfirm}>
                                    COMPOUND
                                </button>
                            {/if}
                        </div>  
                        <div class="withdraw-button flex flex-justify-end">
                            <button 
                                class="margin-0 primary small squared" 
                                disabled={currentYield.isEqualTo(0)}
                                on:click={openWithdrawStakingConfirm}>
                                WITHDRAW {yieldToken.token_symbol}
                            </button>
                        </div> 
                    </div>
                {/if}
                <div class="flex-row staked">
                    <span class="flex-grow ">Staked:</span>
                    <div class="flex-row">
                        <span class="flex-grow text-primary-dimmer">{stringToFixed(totalStaked, 8)}</span>
                        <strong class="symbol text-color-secondary">{`${stakingToken.token_symbol}${stakingContractType === "liquidity_mining_smart_epoch" ? " LP" : ""}`}</strong>
                    </div>
                </div>
                {#if useTimeRamp}
                    <div class="flex-row">
                        <div class="flex-row flex-grow">
                            Reward Rate:
                            <HelpFilled 
                                margin={"0 0 0 4px"}
                                tooltip={[
                                    "Your reward rate increases the longer you stay in the pool. If you remove your stake, the reward rate will reset. Reward rate increases by 10% each day, to a maximum of 100%.",
                                    "Example : If your stake is 1,000, there is 4,000 staked globally, Global emission Rate is 3000 / hour, your reward rate is 10%.",
                                    "Your Yield Per Hour will be. ( 1000 / 4000 ) * 3000 * 10% = 75 RSWP per hour"
                                ]}
                            />
                        </div>
                        <div class="flex-col flex-align-end ">
                            <span class="weight-600">{rewardRate || 0} %</span>
                            <!-- <span class="text-primary-dimmer">{stringToFixed(stakingInfo.EmissionRatePerHour, 8)}/hour</span> -->
                        </div>
                    </div>
                {/if}
            </div>
            
            <InputSpecific 
                on:input={handleInput} 
                tokenInfo={stakingToken} 
                {isLpToken}
                {getStampCost} 
                small={true} 
                bind:clearInput/>
                
            <div class="flex-row flex-center-center buttons">
                {#if !stakingDisabled}
                    <button class="primary" on:click={openStakingConfirm} disabled={loading || !validStakingAmount }>STAKE</button>
                {/if}
                <button class="primary outline" on:click={openRemoveStakingConfirm} disabled={loading || !hasStake}>REMOVE STAKE</button>
            </div>
        {/if}
    </div>
{/if}

{#if showStakingConfirm && hasBothTokens && validStakingAmount}
    <Modal toggleModal={toggleStakingConfirm} open={openStakingConfirm}>
        <div slot="main">
            <ConfirmStakingToken 
                closeConfirm={toggleStakingConfirm}
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
                {isLpToken}
                {stakingAmount}
                {clearInput} />
        </div>
    </Modal>
{/if}

{#if showRemoveStakeConfirm}
    <Modal toggleModal={toggleRemoveStakingConfirm} open={openRemoveStakingConfirm}>
        <div slot="main">
            <ConfirmRemoveStake 
                closeConfirm={toggleRemoveStakingConfirm}
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
                stakedAmount={totalStaked}
                {currentYield}
                {clearInput}  />
        </div>
    </Modal>
{/if}

{#if showWithdrawStakeConfirm}
    <Modal toggleModal={toggleWithdrawStakingConfirm} open={openWithdrawStakingConfirm}>
        <div slot="main">
            <ConfirmWithdrawStake 
                closeConfirm={toggleWithdrawStakingConfirm} 
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
                {clearInput}
                {currentYield}  />
        </div>
    </Modal>
{/if}

{#if showCompoundStakeConfirm}
    <Modal toggleModal={toggleCompoundStakingConfirm} open={openCompoundStakingConfirm}>
        <div slot="main">
            <ConfirmCompoundStake 
                closeConfirm={toggleCompoundStakingConfirm} 
                {stakingInfo}
                {stakingToken}
                {yieldToken}
                {currentYield}  />
        </div>
    </Modal>
{/if}