<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';
    import ShareChange from './confirm-share-change.svelte'

    //Icons
    import Base64SvgLogo from '../../icons/base64_svg.svelte'
    import LamdenLogo from '../../icons/lamden-logo.svelte'
    import PlusSign from '../../icons/plus-sign.svelte'
    import CloseIcon from '../../icons/close.svelte';

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

    pageStats.subscribe((value) => console.log(value))

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
        width: 290px;
    }
    .sub-text{
        margin: 0.5rem 0;
        width: 90%;
    }
    .amount-row{
        margin: 0.5rem 0;
    }
    .modal-confirm-details-box{
        padding-top: 1rem;
    }
</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You will receive</p>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="flex-col text-xlarge to-receive">
        <div class="flex-row flex-center-spacebetween amount-row">
            <span class="number-reg">{stringToFixed($pageStats.amounts.token, 4)}</span>
            <div class="flex-row flex-center-spacebetween">
                <span>{selectedToken.token_symbol}</span>
                <Base64SvgLogo string={selectedToken?.logo_svg_base64} width="30px" margin={"0 0 0 10px"}/>
            </div>
        </div>
        <PlusSign width="18px" height="18px" margin="0" color="var(--text-primary-dim)"/>
        <div class="flex-row flex-center-spacebetween amount-row">
            <span class="number-reg">{stringToFixed($pageStats.amounts.currency, 4)}</span>
            <div class="flex-row flex-center-spacebetween">
                <span >{config.currencySymbol}</span>
                <LamdenLogo width={'30px'} height={'30px'} margin={"0 0 0 10px"}/>
            </div>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dimmer">
        Output is estimated. If the price changes by more than 0.5% your transaction will revert.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row flex-align-center modal-confirm-item">
            <p class="text-primary-dim">{`Pool Tokens Burned`}</p>
            <p class="number">{stringToFixed($pageStats.lpTokenAmount, 4)}</p>
        </div>
        <ShareChange />
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={removeLiquidity} text="Confirm Remove" />
        </div>
    </div>
</div>