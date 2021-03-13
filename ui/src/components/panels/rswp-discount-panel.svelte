<script>
    import { getContext } from 'svelte'
    import BigNumber from 'bignumber.js'

    //Icons 
    import FuelTankIcon from '../../icons/fuel-tank.svelte'
    import RocketswapIcon from '../../icons/rocketswap-logo.svelte'

    // Components
    import InputSpecific from '../inputs/input-specific.svelte'
    import ConfirmFillTank from '../confirms/confirm-fill-tank.svelte'
    import Modal from '../misc/modal.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
	const walletService = WalletService.getInstance();

    // Misc
    import { stringToFixed, toBigNumber, toBigNumberPrecision } from "../../utils"
    import { ammFuelTank_stakedAmount, ammFuelTank_discount, rswpBalance } from "../../store"  
    import { config } from "../../config" 

    const { rswpToken } = getContext('rswpContext')

    let showFillTankConfirm = false;
    let clearInput
    
    $: fillAmount = null;
    $: tankPercent = $ammFuelTank_discount?.isGreaterThan(0) ?  $ammFuelTank_discount.plus(-1).multipliedBy(-1) : toBigNumber("0");
    $: fuelLevel = tankPercent.multipliedBy(80).plus(20)
    $: tankPercentDisplay = tankPercent.multipliedBy(100)
    $: isfillAmount = fillAmount?.isGreaterThan(0);
    $: newPercent = calcNewPercet(fillAmount);
    $: newPercentDisplay = newPercent?.multipliedBy(100);
    $: addingMore = $ammFuelTank_stakedAmount?.isLessThan(fillAmount);
    $: differenceInAmount = fillAmount ? $ammFuelTank_stakedAmount?.minus(fillAmount) : toBigNumber("0");
    $: same = stringToFixed(newPercentDisplay, 2) ===  stringToFixed(tankPercentDisplay, 2)
    $: insufficientRSWP = fillAmount?.isGreaterThan($rswpBalance) || false;

    $: log = console.log({
        fillAmount: fillAmount?.toString() || fillAmount,
        tankPercent: tankPercent?.toString(),
        fuelLevel: fuelLevel?.toString(),
        tankPercentDisplay: tankPercentDisplay?.toString(),
        isfillAmount,
        newPercent: newPercent?.toString(),
        newPercentDisplay: newPercentDisplay?.toString(),
        addingMore,
        differenceInAmount: differenceInAmount?.toString(),
        same
    })

    const calcNewPercet = (value) => {
        if (!value) return null
        return toBigNumberPrecision((1000000000 * (Math.pow(value, ( 1 / 1000000000.0 )) - 1 ) * 0.05), 4)
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
        fillAmount = toBigNumberPrecision(e.detail, 8)
    }

    const openFillTankConfirm = () => showFillTankConfirm = true

    const toggleFillTankConfirm = () => {
        if (showFillTankConfirm) showFillTankConfirm = false
        else showFillTankConfirm = true
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
                linear-gradient(0deg, var(--fuel-tank-panel-fuel-bg-color) ${fuelLevel}%, rgba(255,255,255,0) ${fuelLevel}%),
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
        <span 
            class="text-massive weight-600" 
            class:text-error={fillAmount && !addingMore && !same}
            class:text-success={fillAmount && addingMore && !same}>
            {stringToFixed(newPercentDisplay ? newPercentDisplay : tankPercentDisplay, 2)}%
        </span>

        <div class="flex-grow flex-col flex-justify-spacearound">
            <div class="staked flex-row">
                <span class="flex-grow">Staked:</span>
                <span class="weight-600">{stringToFixed($ammFuelTank_stakedAmount, 8)} <strong class="text-shadow text-color-primary">{config.ammTokenSymbol}</strong></span>
            </div>
            <InputSpecific on:input={handleInput} tokenInfo={$rswpToken} small={true} bind:clearInput/>
            <div class="flex-row flex-center-center buttons">
                <button class="text-color-white primary" on:click={openFillTankConfirm} disabled={!isfillAmount || same || insufficientRSWP}>
                    {#if isfillAmount}
                        {#if insufficientRSWP}
                            {`Insufficient ${config.ammTokenSymbol} Balance`}
                        {:else}
                            {addingMore ? 'Add' : 'Remove'} {stringToFixed(differenceInAmount.absoluteValue(), 8)} {config.ammTokenSymbol}
                        {/if}
                    {:else}
                        Enter Fuel Amount
                    {/if}
                </button>
            </div>
        </div>
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
                {clearInput} />
        </div>
    </Modal>
{/if}