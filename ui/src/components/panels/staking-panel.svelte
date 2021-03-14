<script>
    import { setContext, onDestroy } from 'svelte'
    
    //Icons 
    import YieldLogo from '../../icons/yield-logo.svelte'


    // Components
    import InputSpecific from '../inputs/input-specific.svelte'
    import ConfirmStakingToken from '../confirms/confirm-staking-stake.svelte'
    import ConfirmRemoveStake from '../confirms/confirm-staking-remove.svelte'
    import ConfirmWithdrawStake from '../confirms/confirm-staking-withdraw.svelte'
    import Modal from '../misc/modal.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { userYieldInfo, tabHidden } from "../../store"  
    import { toBigNumberPrecision, toBigNumber, stakingCalculator, stringToFixed } from "../../utils"  

    setContext('stakingPanelContext', {
		getStampCost
	});

    export let stakingInfo;
    export let horizontal = false;

    let stakingAmount = toBigNumber("0");
    let loading = false;
    let showStakingConfirm = false;
    let showRemoveStakeConfirm = false;
    let showWithdrawStakeConfirm = false;
    let clearInput
    let timer_yieldUpdate = null;

    $: stakingCalcs = stakingCalculator(stakingInfo);

    $: userYield = $userYieldInfo[stakingInfo?.contract_name];
    $: totalStaked = userYield ? userYield.total_staked : toBigNumber("0");
    $: additionalYield = userYield ? stakingCalcs.calcNewYeild(userYield) : toBigNumber("0");
    $: currentYield = userYield ? userYield.current_yield.plus(additionalYield) : toBigNumber("0");
    $: hasStake = totalStaked?.isGreaterThan(0) || false;
    $: startTimer = !startTimer && currentYield.isGreaterThan(0) ? startUpdater() : null;

    $: stakingToken = stakingInfo?.staking_token || null;
    $: yieldToken = stakingInfo?.yield_token || null;
    $: hasBothTokens = yieldToken && stakingToken;

    $: validStakingAmount = stakingAmount.isGreaterThan(0);

    
    $: log = console.log({
        startingYield: userYield?.current_yield.toString(),
        additionalYield: additionalYield.toString(),
        currentYield: currentYield.toString()
    })
    
    onDestroy(() => {
       clearInterval(startTimer)
       startTimer = null
    })

    const startUpdater = () => {
        "!!!STARTING TIMER!!!"
        if (!timer_yieldUpdate) timer_yieldUpdate = setInterval(updateYeild, 15000)
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

    const handleInput = (e) => {
        stakingAmount = toBigNumberPrecision(e.detail, 8)
        //console.log({e: e.detail, stakingAmount, validStakingAmount})
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
    .horizontal{
        position: relative;

        width: 100%;
        padding: 10px 30px;
        max-width: unset;
        margin: 1rem 0;
    }
    .header{
        position: relative;
        margin-bottom: 1rem;
    }
    .logos-symbols{
        margin-right: 50px;
    }
    .symbols{
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        margin-bottom: -1.5rem;
        z-index: 1;
    }
    .symbol{
        margin-left: 4px;
    }
    .symbol-horizontal{
        margin: 0;
    }
    .symbols-horizontal{
        position: absolute;
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        top: 10px;
        left: 30px; 
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
    .earned{
        margin: 0.5rem 0 0;
    }
    .staked{
        margin: 0.5rem 0;
    }
    .withdraw-button{
        min-height: 20px;
    }
    .smallStakeButton{
        margin: 0;
    }   

    .largeStakeButton{
        display: none;
        margin: 0 0 0 10px;
    }
    @media screen and (min-width: 430px) {
        .panel-container{
            margin: 10px;
        }
    }
    @media screen and (min-width: 800px) {
        .largeStakeButton{
            display: block;
        }
        .smallStakeButton{
            display: none;
        }
    }

</style>

{#if hasBothTokens}
    {#if !horizontal}
    <div class="panel-container text-small">
        <div class="flex-col flex-center-center header ">
            <span class="symbols weight-600 text-xlarge">{`${stakingToken.token_symbol} - ${yieldToken.token_symbol}`}</span>
            <YieldLogo {yieldToken} {stakingToken} />
        </div>
        <div class="info">
            <div class="flex-row">
                <span class="flex-grow">APY:</span>
                <div class="flex-col flex-align-end ">
                    <span class="weight-600">{stringToFixed(stakingCalcs.emissionRatePerYear, 8)}</span>
                    <span class="text-primary-dimmer">{stringToFixed(stakingInfo.EmissionRatePerHour, 8)}/hour</span>
                </div>
            </div>

            <div class="flex-row earned">
                <span class="flex-grow ">Earned:</span>
                <div class="flex-row">
                    <span class="flex-grow text-primary-dimmer">{stringToFixed(currentYield, 8)}</span>
                    <strong class="symbol text-color-secondary">{yieldToken.token_symbol}</strong>
                </div>
            </div>
            <div class="withdraw-button flex flex-justify-end">
                {#if currentYield.isGreaterThan(0)}
                    <button 
                        class="margin-0 primary small " 
                        disabled={currentYield.isEqualTo(0)}
                        on:click={openWithdrawStakingConfirm}>
                        WITHDRAW {yieldToken.token_symbol}
                    </button>
                {/if}
            </div>  
            <div class="flex-row staked">
                <span class="flex-grow ">Staked:</span>
                <div class="flex-row">
                    <span class="flex-grow text-primary-dimmer">{stringToFixed(totalStaked, 8)}</span>
                    <strong class="symbol text-color-secondary">{stakingToken.token_symbol}</strong>
                </div>
            </div>

        </div>
        <InputSpecific on:input={handleInput} tokenInfo={stakingToken} {getStampCost} small={true} bind:clearInput/>
        <div class="flex-row flex-center-center buttons">
            <button class="primary" on:click={openStakingConfirm} disabled={loading || !validStakingAmount}>STAKE</button>
            <button class="primary outline" on:click={openRemoveStakingConfirm} disabled={loading || !hasStake}>REMOVE STAKE</button>
        </div>
    </div>
    {:else}
        <div class="flex-row panel-container horizontal text-small">
            <div class="logos-symbols flex-col flex-center-center">
                <YieldLogo {yieldToken} {stakingToken} margin=""/>
                <span class="symbols-horizontal weight-600 text-large">{`${stakingToken.token_symbol} - ${yieldToken.token_symbol}`}</span>
            </div>
            <div class="flex-row flex-grow flex-justify-spaceevenly">
                <div class="flex-col detail-col">
                    <span>APY:</span>
                    <div class="flex-col flex-align-end ">
                        <span class="weight-600">{stringToFixed(stakingCalcs.emissionRatePerYear, 8)}</span>
                        <span class="text-primary-dimmer">{stringToFixed(stakingInfo.EmissionRatePerHour, 8)}/hour</span>
                    </div>
                </div>
                <div class="flex-col detail-col">
                    <span><strong class="symbol-horizontal text-color-secondary">{stakingToken.token_symbol}</strong> Staked:</span>
                    <div class="flex-row">
                        <span class="text-primary-dimmer">{stringToFixed(totalStaked, 8)}</span>
                    </div>
                    {#if totalStaked.isGreaterThan(0)}
                        <button class="primary small" on:click={openRemoveStakingConfirm} disabled={loading || !hasStake}>REMOVE STAKE</button>
                    {/if}

                </div>
                <div class="flex-col detail-col">
                    <span><strong class="symbol-horizontal text-color-secondary">{yieldToken.token_symbol}</strong> Earned:</span>
                    <div class="flex-row">
                        <span class="text-primary-dimmer">{stringToFixed(currentYield, 8)}</span>
                        
                    </div>
                    {#if currentYield.isGreaterThan(0)}
                        <button 
                            class="primary small" 
                            disabled={currentYield.isEqualTo(0)}
                            on:click={openWithdrawStakingConfirm}>
                            WITHDRAW {yieldToken.token_symbol}
                        </button>
                    {/if}
                </div>
            </div>
            
            <div class="flex-row flex-center-center stake">
                <InputSpecific on:input={handleInput} tokenInfo={stakingToken} {getStampCost} small={true} short={true} bind:clearInput />   
                <button 
                    class="stake primary small smallStakeButton" 
                    on:click={openStakingConfirm} 
                    disabled={loading || !validStakingAmount}>
                    STAKE
                </button>
                <button 
                    class="stake primary largeStakeButton" 
                    on:click={openStakingConfirm} 
                    disabled={loading || !validStakingAmount}>
                    STAKE
                </button>
            </div>
        </div>
    {/if}
{/if}

{#if showStakingConfirm && hasBothTokens && validStakingAmount}
    <Modal toggleModal={toggleStakingConfirm} open={openStakingConfirm}>
        <div slot="main">
            <ConfirmStakingToken 
                closeConfirm={toggleStakingConfirm}
                {stakingInfo}
                {stakingToken} 
                {yieldToken} 
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