<script>
    import { getContext } from 'svelte'

    //Components
    import Button from '../button.svelte';
    import InputNumber from '../inputs/input-number.svelte'

    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import CloseIcon from '../../icons/close.svelte'
    import DicrectionalArrowIcon from '../../icons/directional-arrow.svelte'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumberPrecision, getAmmStakeDetails } from '../../utils'
    import { config } from '../../config'

    //Props
    export let currentFillAmount;
    export let currentDiscount;
    export let closeConfirm;
    export let calcNewPercent;
    export let clearInput;
    export let resetPanel;

    let newDiscount;
    let differenceInAmount = toBigNumberPrecision(0);

    $: newFillAmount = currentFillAmount.minus(differenceInAmount);

    let logoSize = "25px"
    let loading = false;

    const { rswpToken } = getContext('rswpContext')

    const success = () => {
        finish();
        clearInput();
        resetPanel();
        setTimeout(getAmmStakeDetails, 2000)
        setTimeout(getAmmStakeDetails, 5000)
        closeConfirm(false);
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

    const handleFillTank = () => {
        loading = true;
        // stakingContractName, args, stakingToken, yieldToken
        let args = {
            amount: {"__fixed__": stringToFixed(newFillAmount, 8)}
        }
        walletService.stakeTokensInAMM(config.ammContractName, args, newDiscount, false, {success, error})
        .catch(err => {
            console.log(err)
            finish()
        })
    }
    const handleAmountInput = (e) => {
        if (e.detail.isNaN() || !e.detail){
            differenceInAmount = toBigNumberPrecision(0)
        }else{
            differenceInAmount = e.detail
        }
        newDiscount =  calcNewPercent(currentFillAmount.minus(differenceInAmount)).multipliedBy(100)
    }
</script>


<style>
    .modal-style{
        max-width:350px;
    }
    .modal-confirm-header{
        margin-bottom: 1rem;
    }
    .modal-confirm-details-box{
        padding-top: 1rem;
    }
    .details{
        margin: 0 0 1rem 0;
    }
    @media screen and (min-width: 430px) {
        .modal-style{
            width: 100vw;
            margin-top: 8rem;
        }
    }
</style>

<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <span class="text-large">Confirm Remove Rocket Fuel</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="details flex-col">
        <InputNumber placeholder="0.0" on:input={handleAmountInput} startingValue={0} margin="0.25rem 0 1rem"/>
        <div class="flex-row flex-center-spacebetween text-xlarge">
            <span>{stringToFixed(currentDiscount, 2)}%</span>
            <DicrectionalArrowIcon 
                direction="right" 
                width="25px" 
                color="var(--error-color)"
                styles="position: relative; top: 4px;" />
            <span>{stringToFixed(newDiscount, 2)}%</span>
        </div>
    </div>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">Current Fuel Amount</span>
            <div class="flex-row flex-center-end ">
                <span class="weight-600">{stringToFixed(currentFillAmount, 8)} {config.ammTokenSymbol}</span>
            </div>
        </div>
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">New Fuel Amount</span>
            <div class="flex-row flex-center-end ">
                <span class="weight-600">{stringToFixed(newFillAmount, 8)} {config.ammTokenSymbol}</span>
            </div>
        </div>
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">Removing</span>
            <div class="flex-row flex-center-end ">
                <span class="weight-600">{stringToFixed(differenceInAmount.absoluteValue(), 8)}</span>
                <TokenLogo tokenMeta={$rswpToken} width={logoSize}  margin="0 0 0 10px" />
            </div>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button 
                style="secondary" 
                loading={loading} 
                callback={handleFillTank} 
                text={`REMOVE ${config.ammTokenSymbol}`} />
        </div>
    </div>
</div>