<script>
    //Components
    import Button from '../button.svelte';
    import InputNumber from '../inputs/input-number.svelte'

    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import PlusSignIcon from '../../icons/plus-sign.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumberPrecision, toBigNumber } from '../../utils'
    import { config } from '../../config'

    //Props
    export let stakingInfo;
    export let stakingToken;
    export let yieldToken;
    export let closeConfirm;
    export let clearInput;
    export let currentYield;

    let logoSize = "30px"
    let loading = false;
    const yieldAmount = currentYield

    $: isAMMTokenFarmContract = config.ammTokenContract === stakingInfo.contract_name
    $: withdrawAmount = yieldAmount;
    $: withdrawAmountOverBalance = withdrawAmount.isGreaterThan(yieldAmount);
    $: withdrawAmountLessFee = isAMMTokenFarmContract ? withdrawAmount?.multipliedBy(0.9) || toBigNumber("0") : withdrawAmount;

    const handleAmountInput = (e) => {
        withdrawAmount = e.detail
    }

    const success = () => {
        clearInput();
        finish();
        closeConfirm(false);
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

    const handleWithdrawStakedTokens = () => {
        loading = true;
        let args = {
            amount: {"__fixed__": stringToFixed(withdrawAmount.dividedBy(90).multipliedBy(100), 8)}
        }
        if (stakingInfo.contract_name === config.ammTokenStakingContract) {
            args.amount.__fixed__ = stringToFixed(withdrawAmount.dividedBy(90).multipliedBy(100), 8)
        }
        walletService.withdrawStake(stakingInfo.contract_name, args, stakingToken, yieldToken, {success, error})
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
    .sub-text{
        margin: -1rem 0 1rem;
        width: 90%;
    }

    .staking-deatils{
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
        <span class="text-large">Confirm Withdraw {yieldToken.token_symbol}</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="staking-deatils flex-col text-xlarge">
        <div class="flex-row flex-align-center">
            <TokenLogo tokenMeta={yieldToken} width={logoSize}  margin="0 10px 0 0" />
            {yieldToken.token_symbol}
        </div>
        <InputNumber placeholder="0" on:input={handleAmountInput} startingValue={stringToFixed(yieldAmount, 8)} margin="0.25rem 0 1rem"/>
    </div>
    {#if stakingInfo.contract_name === config.ammTokenStakingContract}
        <p class="text-xsmall sub-text text-primary-dim">
            ** 10% of the yield from all {config.ammTokenSymbol} withdrawals goes to the developers of Rocketswap!  This amount will be added automatically to the transaction total.
        </p>
    {/if}
    <div class="flex-col modal-confirm-details-box text-small weight-400">
         <div class="flex-row">
            <span><strong class="symbol-horizontal text-color-secondary">{yieldToken.token_symbol}</strong> Earned:</span>
            <span class="weight-600 flex-grow text-align-right">{stringToFixed(yieldAmount, 8)}</span>
        </div>
        <div class="flex-row">
            <span>Get:</span>
            <span class="weight-600 flex-grow text-align-right">{stringToFixed(withdrawAmountLessFee, 8)} <strong class="symbol-horizontal text-color-secondary">{yieldToken.token_symbol}</strong></span>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" 
                loading={loading} 
                disabled={withdrawAmountOverBalance}
                callback={handleWithdrawStakedTokens} 
                text={
                    withdrawAmountOverBalance ? 
                    `INSUFFICIENT ${yieldToken.token_symbol}` : 
                    `WITHDRAW ${yieldToken.token_symbol} `
                } 
            />
        </div>
    </div>
</div>
