<script>
    //Components
    import Button from '../button.svelte';


    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import CloseIcon from '../../icons/close.svelte';
    import DicrectionalArrowIcon from '../../icons/directional-arrow.svelte'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumberPrecision, stakingCalculator } from '../../utils'
    import { config } from '../../config'

    //Props
    export let stakingInfo;
    export let stakingToken;
    export let yieldToken;
    export let currentYield
    export let closeConfirm;

    let logoSize = "30px"
    let loading = false;
    const yieldAmount = currentYield

    $: singleAssetContract = stakingInfo.contract_name === config.ammTokenYieldContract


    const success = () => {
        finish();
        closeConfirm(false);
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

    const handleCompoundYield = () => {
        loading = true;
        let args = {
            contract: stakingInfo.contract_name
        }
        walletService.compoundYield(config.ammTokenYieldContract, args, yieldAmount, stakingToken, yieldToken, {success, error})
        .catch(err => {
            console.log(err)
            finish()
        })
    }
    const handleCompoundSelf = () => {
        loading = true;
        let args = {
            amount: {"__fixed__": "0"}
        }
        walletService.compoundSelf(config.ammTokenYieldContract, args, yieldToken, {success, error})
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
        margin: 1rem 0;
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
        <span class="text-large">Confirm Compound</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="staking-deatils flex-col">
        <div class="flex-row">
            <TokenLogo tokenMeta={stakingToken} width={logoSize}  margin="0 10px 0 0" />
            <span>{stakingToken.token_symbol}</span>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dim">
        ** 10% of the yield from all RSWP withdrawals goes to the developers of Rocketswap! This amount will be added automatically to the transaction total.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">Yield Amount:</span>
            <div class="flex-row">
                <span>{stringToFixed(yieldAmount, 8)}
                    <strong class="symbol text-color-secondary">{yieldToken.token_symbol}</strong>
                </span>
            </div>
        </div>
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">Send To:</span>
            <div class="flex-row">
                RSWP
                <DicrectionalArrowIcon direction="right" width="10px" margin="0 4px 0" />
                RSWP
            </div>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button 
                style="secondary" 
                loading={loading} 
                callback={singleAssetContract ? handleCompoundSelf : handleCompoundYield} 
                text="COMPOUND RSWP" />
        </div>
        <p class="text-xsmall text-justify text-primary-dim">
            * Staking will compound interest already in your RSWP POOL. This action will also reinvest any yield due on the RSWP pool.
        </p>
    </div>
</div>