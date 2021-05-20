<script>
    import { getContext } from 'svelte'
    import BigNumber from 'bignumber.js'

    //Icons 
    import FuelTankIcon from '../../icons/fuel-tank.svelte'
    import RocketswapIcon from '../../icons/rocketswap-logo.svelte'

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'
    import ConfirmFillTank from '../confirms/confirm-fill-tank.svelte'
    import ConfirmEmptyTank from '../confirms/confirm-empty-tank.svelte'
    import Modal from '../misc/modal.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { stringToFixed, toBigNumber, toBigNumberPrecision } from "../../utils"
    import { ammFuelTank_stakedAmount, ammFuelTank_discount, rswpBalance } from "../../store"  
    import { config, ammStakingValues } from "../../config" 

    const { rswpToken } = getContext('rswpContext')

    const minimumStakeRequired = toBigNumber(1361)

    let showFillTankConfirm = false;
    let showRemoveAllStakeConfirm = false;
    let clearInput

    $: fillAmount = null;
    $: tankPercent = $ammFuelTank_discount?.isGreaterThan(0) ?  $ammFuelTank_discount.plus(-1).multipliedBy(-1) : toBigNumber("0");
    $: fuelLevel = tankPercent.multipliedBy(80).plus(20)
    $: tankPercentDisplay = tankPercent.multipliedBy(100)
    $: isfillAmount = fillAmount?.isGreaterThan(0);
    $: newPercent = calcNewPercent(fillAmount);
    $: newPercentDisplay = newPercent?.multipliedBy(100);
    $: hasStake = $ammFuelTank_stakedAmount.isGreaterThan(1);
    $: addingMore = $ammFuelTank_stakedAmount?.isLessThan(fillAmount);
    $: differenceInAmount = fillAmount ? $ammFuelTank_stakedAmount?.minus(fillAmount) : toBigNumber("0");
    $: same = stringToFixed(newPercentDisplay, 2) ===  stringToFixed(tankPercentDisplay, 2)
    $: insufficientRSWP = fillAmount?.isGreaterThan($rswpBalance) || false;
    $: minimumStakeMet = fillAmount?.isGreaterThanOrEqualTo(minimumStakeRequired);

    const calcNewPercent = (value) => {
        if (!value) return null
        const {log_accuracy, multiplier, discount_floor} = ammStakingValues

        let discount = toBigNumber(Math.log(value) * multiplier - discount_floor)
        if (discount.isGreaterThan("0.99")) discount = toBigNumber("0.99")
        if (discount.isLessThan(0)) discount = toBigNumber("0")
        discount = toBigNumberPrecision(discount, 4)
        return discount
    }

    async function getStampCost(contract, method){
		let txList = [
			{contract, method}
		]
		return await walletService.estimateTxCosts(txList)
    }
    
    const handleInput = (e) => {
        if (!e?.detail || e.detail.isNaN() || e.detail.isLessThanOrEqualTo(0)){
            fillAmount = null;
            return
        }
        fillAmount = toBigNumberPrecision(e.detail, 8).plus($ammFuelTank_stakedAmount)
    }

    const openFillTankConfirm = () => toggleFillTankConfirm(true)
    const toggleFillTankConfirm = (e, force = null) => {
        if (force === null){
            if (showFillTankConfirm) showFillTankConfirm = false
            else showFillTankConfirm = true
        }else{
            showFillTankConfirm = force;
        }
    }

    const openRemoveAllStakeConfirm = () => toggleRemoveAllStakeConfirm(true)
    const toggleRemoveAllStakeConfirm = (e, force = null) => {
        if (force === null){
            if (showRemoveAllStakeConfirm) showRemoveAllStakeConfirm = false
            else showRemoveAllStakeConfirm = true
        }else{
            showRemoveAllStakeConfirm = force;
        }
    }

    const resetPanel = () => {
        fillAmount = null
    }
</script>

<style>
    .panel-container{
        max-width: 300px;
        padding: 20px;

        margin: 0;

        border-radius: 32px;
        background: var(--panel-background-gradient);

        box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
    }
    p.title{
        margin: 0;
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        font-weight: 800;
    }
    .header{
        margin-bottom: 0;
    }
    .info{
        margin: 1rem 0;
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
    button.small{
        margin: 0 0 0.25rem;
    }
    .min-stake-msg{
        margin: 0.5rem 0 0 0;
    }
    .staked{
        margin-bottom: 0;
        
    }
    .text-shadow{
        text-shadow: 1px 1px var(--fuel-tank-text-shadow);
    }
    @media screen and (min-width: 430px) {
        .panel-container{
            margin: 10px;
        }
    }
</style>

{#if $rswpToken}
    <div 
        class="flex-col panel-container text-small" 
        style={`
            background: 
                linear-gradient(0deg, var(--fuel-tank-panel-fuel-bg-color) ${fuelLevel}%, rgba(255,255,255,0) ${fuelLevel}%),
                var(--panel-background-gradient);
        `}>
        <p class="title text-xlarge text-center">Rocket Fuel</p>
        <div class="flex flex-center-center header">
            
            <div class="fuel-tank-icon">
                <FuelTankIcon width="75px" color="var(--text-primary-color)"/>
                <div class="rocketswap-icon">
                    <RocketswapIcon width="25px" color="var(--text-primary-color-inverted)"/>
                </div>
            </div>
        </div>
        <div class="info">
            <div class="flex-row flex-align-center">
                {#if !fillAmount}
                    <span class="flex-grow">Current Trade Fee Discount:</span> 
                {:else}
                    <span class="flex-grow">
                        <strong class="text-color-highlight">NEW</strong> Trade Fee Discount:
                    </span> 
                {/if}
                <span 
                    class=" weight-600" 
                    class:text-error={fillAmount && !addingMore && !same}
                    class:text-success={fillAmount && addingMore && !same}>
                    {stringToFixed(newPercentDisplay ? newPercentDisplay : tankPercentDisplay, 2)}%
                </span>
            </div>
            <div class="staked flex-row">
                <span class="flex-grow">Staked:</span>
                <span class="weight-600">
                    {stringToFixed($ammFuelTank_stakedAmount, 8)} 
                    <strong class="text-shadow text-color-secondary">{config.ammTokenSymbol}</strong>
                </span>
            </div>
        </div>
        <InputSpecific on:input={handleInput} tokenInfo={$rswpToken} small={true} bind:clearInput/>
        <div class="flex-row flex-center-center buttons">
            <button class="text-color-white primary" on:click={openFillTankConfirm} disabled={!isfillAmount || insufficientRSWP}>
                ADD FUEL
            </button>
            <button class="primary outline" on:click={openRemoveAllStakeConfirm} disabled={!hasStake}>REMOVE FUEL</button>
        </div>
        <p class="min-stake-msg text-center text-small text-color-white">Minimum Stake is 1361 RSWP</p>
    </div>
{/if}

{#if showFillTankConfirm}
    <Modal toggleModal={toggleFillTankConfirm} open={openFillTankConfirm}>
        <div slot="main">
            <ConfirmFillTank
                closeConfirm={toggleFillTankConfirm} 
                currentDiscount={tankPercentDisplay}
                newDiscount={newPercentDisplay}
                currentFillAmount={$ammFuelTank_stakedAmount}
                newFillAmount={fillAmount}
                {addingMore}
                {differenceInAmount}
                {clearInput} 
                {resetPanel}/>
        </div>
    </Modal>
{/if}

{#if showRemoveAllStakeConfirm}
    <Modal toggleModal={toggleRemoveAllStakeConfirm} open={openRemoveAllStakeConfirm}>
        <div slot="main">
            <ConfirmEmptyTank
                closeConfirm={toggleRemoveAllStakeConfirm} 
                currentDiscount={tankPercentDisplay}
                currentFillAmount={$ammFuelTank_stakedAmount}
                {clearInput} 
                {resetPanel}
                {calcNewPercent}/>
        </div>
    </Modal>
{/if}