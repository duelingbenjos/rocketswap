<script>
    //Components
    import Button from '../button.svelte';

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
    export let newFillAmount;
    export let currentDiscount;
    export let newDiscount;
    export let addingMore;
    export let differenceInAmount;
    export let closeConfirm;
    export let clearInput;

    let logoSize = "25px"
    let loading = false;

    const success = () => {
        finish();
        clearInput();
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
        walletService.stakeTokensInAMM(config.ammContractName, args, newDiscount, addingMore, {success, error})
        .catch(err => {
            console.log(err)
            finish()
        })
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
        <span class="text-large">Confirm Fill Fuel Tank</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="details flex-col">
        <div class="flex-row flex-center-spacebetween text-xlarge">
            <span>{stringToFixed(currentDiscount, 2)}%</span>
            <DicrectionalArrowIcon 
                direction="right" 
                width="25px" 
                color={addingMore ? "var(--success-color)" : "var(--error-color)"}
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
            <span class="flex-grow text-primary-dim">{addingMore ? "Adding" : "Removing"}</span>
            <div class="flex-row flex-center-end ">
                <span class="weight-600">{stringToFixed(differenceInAmount.absoluteValue(), 8)}</span>
                <TokenLogo tokenMeta={{}} width={logoSize}  margin="0 0 0 10px" />
            </div>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button 
                style="secondary" 
                loading={loading} 
                callback={handleFillTank} 
                text={`${addingMore ? "ADD" : "REMOVE"} ${config.ammTokenSymbol}`} />
        </div>
    </div>
</div>