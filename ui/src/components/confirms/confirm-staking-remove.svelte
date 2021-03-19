<script>
    //Components
    import Button from '../button.svelte';


    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import PlusSignIcon from '../../icons/plus-sign.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumberPrecision } from '../../utils'

    //Props
    export let stakingInfo;
    export let stakingToken;
    export let yieldToken;
    export let stakedAmount;
    export let currentYield;
    export let closeConfirm;
    export let clearInput;

    let logoSize = "30px"
    let loading = false;

    $: EmissionRatePerYear = stakingInfo?.EmissionRatePerHour.multipliedBy(24).multipliedBy(365);

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

    const handleRemoveStakedTokens = () => {
        loading = true;
        // stakingContractName, args, stakingToken, yieldToken
        let args = {}
        walletService.removeStake(stakingInfo.contract_name, args, stakingToken, yieldToken, {success, error})
        .catch(err => {
            console.log(err)
            finish()
        })
    }
</script>


<style>
    .modal-style{
        width: 100vw;
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
    .amount-row{
        margin: 0.25rem 0;
    }
    .staking-deatils{
        margin: 0 0 1rem 0;
    }
    @media screen and (min-width: 430px) {
        .modal-style{
            margin-top: 8rem;
        }
    }
</style>

<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <span class="text-large">Remove Stake and Yield</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="staking-deatils flex-col text-xlarge">
        <div class="flex-row flex-center-spacebetween amount-row">
            <div class="flex-row flex-center-spacebetween">
                <TokenLogo tokenMeta={stakingToken} width={logoSize}  margin="0 10px 0 0" />
                <span>{stringToFixed(stakedAmount, 8)}</span>
            </div>
            <span>{stakingToken.token_symbol}</span>
        </div>
        <PlusSignIcon width="20px" color="var(--text-primary-color-dim)" margin={"0 0 0 5px"}/>
        <div class="flex-row flex-center-spacebetween amount-row">
            <div class="flex-row flex-center-spacebetween">
                <TokenLogo tokenMeta={yieldToken} width={logoSize}  margin="0.25rem 10px 0 0" />
                <span>{stringToFixed(currentYield, 8)}</span>
            </div>
            <span>{yieldToken.token_symbol}</span>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dim">
        ** This will remove your entire stake as well as all earned {yieldToken.token_symbol}. To remove only {yieldToken.token_symbol} use the WITHDRAW button.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={handleRemoveStakedTokens} text="REMOVE STAKE" />
        </div>
    </div>
</div>