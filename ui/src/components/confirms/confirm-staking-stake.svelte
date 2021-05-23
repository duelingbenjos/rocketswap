<script>
    //Components
    import Button from '../button.svelte';


    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import Rocket from '../../icons/rocket.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumberPrecision, stakingCalculator } from '../../utils'

    //Props
    export let stakingInfo;
    export let stakingToken;
    export let yieldToken;
    export let stakingAmount;
    export let isLpToken;
    export let closeConfirm;
    export let clearInput;

    let logoSize = "30px"
    let loading = false;

    $: EmissionRatePerYear = stakingInfo?.EmissionRatePerHour.multipliedBy(24).multipliedBy(365);
    $: stakingCalcs = stakingCalculator(stakingInfo);


    const success = () => {
        clearInput();
        finish();
        closeConfirm(false);
    }

    const error = () => {
        finish()
        closeConfirm(false);
    }

    const finish = () => {
        loading = false;
    }

    const handleStakeTokens = () => {
        loading = true;
        // stakingContractName, args, stakingToken, yieldToken
        let args = {
            amount: {"__fixed__": stringToFixed(stakingAmount, 8)}
        }
        walletService.stakeTokens(stakingInfo.contract_name, args, stakingToken, yieldToken, isLpToken, {success, error})
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
    .to-earn{
        margin: 1rem 0 0 0;
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
        <span class="text-large">Confirm Staking {isLpToken}</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="staking-deatils flex-col">
        <div class="flex-row flex-center-spacebetween amount-row text-xlarge">
            <div class="flex-row flex-center-spacebetween">
                <TokenLogo tokenMeta={stakingToken} width={logoSize}  margin="0 10px 0 0" />
                <span>{toBigNumberPrecision(stakingAmount, 8)}</span>
            </div>
            <span>{stakingToken.token_symbol}</span>
        </div>
        <p class="to-earn text-primary-dim text-large">To Earn</p>
        <div class="flex-row flex-center-start amount-row text-xlarge">
            <div class="flex-row flex-center-spacebetween">
                <TokenLogo tokenMeta={yieldToken} width={logoSize}  margin="0 10px 0 0" />
            </div>
            <span>{yieldToken.token_symbol}</span>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dim">
        ** The only way to unstake is to remove your ENTIRE stake at once using the REMOVE STAKE button.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row">
            <span class="flex-grow text-primary-dim">APY:</span>
            <div class="flex-col flex-align-end ">
                <span class="weight-600">{stakingCalcs.emissionRatePerYear} %</span>
                <!-- <span class="text-primary-dimmer">{stakingInfo.EmissionRatePerHour}/hour</span> -->
            </div>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={handleStakeTokens} text="STAKE" />
        </div>
    </div>
</div>