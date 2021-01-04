<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';

    //Icons
    import Base64SvgLogo from '../../icons/base64_svg.svelte'
    import LamdenLogo from '../../icons/lamden-logo.svelte'
    import PlusSign from '../../icons/plus-sign.svelte'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed } from '../../utils'
    import { config } from '../../config'

    //Props
    export let selectedToken;
    export let closeConfirm;

    const { pageStats, resetPage } = getContext('pageContext')

    let loading = false;

    const success = () => {
        loading = false;
        closeConfirm()
        resetPage()
    }

    const error = () => {
        loading = false;
    }

    const removeLiquidity = () => {
        if (!$pageStats.lpTokenAmount) return
        loading = true;
        walletService.removeLiquidity({
        'contract': selectedToken.contract_name,
        'amount': {'__fixed__': stringToFixed($pageStats.lpTokenAmount.toString(), 30)}
        }, selectedToken, { success, error })
    }

</script>


<style>
    .modal-style{
        width: 380px;
    }
    .sub-text{
        margin: 1rem 0;
        width: 90%;
    }
    .amount-row{
        margin: 1rem 0;
    }
    .modal-confirm-details-box{
        padding-top: 1rem;
    }

</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You will receive</p>
        <button class="nostyle" on:click={closeConfirm}>
            <img class="confirm-modal-close-img" src="assets/images/cancel.svg" alt="" />
        </button>
    </div>
    <div class="flex-col text-large">
        <div class="flex-row flex-center-spacebetween amount-row">
            <span>{stringToFixed($pageStats.amounts.token, 4)}</span>
            <div class="flex-row flex-center-spacebetween">
                <span>{selectedToken.token_symbol}</span>
                <Base64SvgLogo string={selectedToken?.logo_svg_base64} width="30px" height="30px" />
            </div>
        </div>
        <PlusSign width="20px" height="20px" margin="0 auto"/>
        <div class="flex-row flex-center-spacebetween amount-row">
            <span>{stringToFixed($pageStats.amounts.currency, 4)}</span>
            <div class="flex-row flex-center-spacebetween">
                <span >{config.currencySymbol}</span>
                <LamdenLogo width={'30px'} height={'30px'} margin={"0 10px"}/>
            </div>
        </div>
    </div>
    <p class="text-xsmall sub-text">
        Output is estimated. If the price changes by more than 0.5% your transaction will revert.
    </p>
    <div class="flex-col modal-confirm-details-box">
        <div class="flex-row modal-confirm-item">
            <p>{`${selectedToken.token_symbol} / ${config.currencySymbol} Tokens Burned`}</p>
            <p class="text-bold">{stringToFixed($pageStats.lpTokenAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>Share Change</p>
            <p class="text-bold">{`${$pageStats.currentLpSharePercent}% => ${$pageStats.newLpSharePercent}%`}</p>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={removeLiquidity} text="Confirm Remove Supply" />
        </div>
    </div>
</div>