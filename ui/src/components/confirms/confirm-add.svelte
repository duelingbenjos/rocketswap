<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed } from '../../utils'
    import { config } from '../../config'

    //Props
    export let selectedToken;
    export let currencyAmount;
    export let tokenAmount;
    export let closeConfirm;

    const { pageStats, resetPage } = getContext('pageContext')

    let loading = false;

    const success = () => {
        loading = false;
        resetPage();
        closeConfirm();
    }

    const error = () => {
        loading = false;
    }

    const addLiquidity = () => {
        if (!currencyAmount || !tokenAmount || !selectedToken) return
        loading = true;
        walletService.addLiquidity({
            'contract': selectedToken.contract_name,
            'currency_amount': {'__fixed__': stringToFixed(currencyAmount.toString(), 30)}
        }, selectedToken, tokenAmount, currencyAmount, { success, error })
    }

</script>


<style>
    .rates{
        margin-top: 0.5rem;
    }
    .lp-amount{
        margin: 1rem 0;
    }
    .modal-style{
        width: 330px;
    }
    .modal-sub-box{
        width: 360px;
    }
    .sub-text{
        margin: 2rem 0 1rem;
        width: 90%;
    }
    .rates > p {
        margin: 0.5px 0;
    }

</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You will receive</p>
        <button class="nostyle" on:click={closeConfirm}>
            <img class="confirm-modal-close-img" src="assets/images/cancel.svg" alt="" />
        </button>
    </div>
    <p class="text-xlarge text-bold lp-amount">{stringToFixed($pageStats.lpToMint, 4)}</p>
    <p class="text-large margin-0">{`${selectedToken.token_symbol} / ${config.currencySymbol} Pool Tokens`}</p>
    <p class="text-xsmall sub-text">
        Output is estimated. If the price changes by more than 0.5% your transaction will revert.
    </p>
    <div class="flex-col modal-confirm-details-box">
        <div class="flex-row modal-confirm-item">
            <p>TAU Deposited</p>
            <p class="text-bold">{stringToFixed(currencyAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>{`${selectedToken.token_symbol} Deposited`}</p>
            <p class="text-bold">{stringToFixed(tokenAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>Rates</p>
            <div class="flex-col rates">
                <p class="text-bold">{`1 TAU = ${stringToFixed($pageStats.quoteCalc.prices.currency, 4)} ${selectedToken.token_symbol}`}</p>
                <p class="text-bold">{`1 ${selectedToken.token_symbol} = ${stringToFixed($pageStats.quoteCalc.prices.token, 4)} TAU`}</p>
            </div>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>Share Change</p>
            <p class="text-bold">{`${$pageStats.currentLpSharePercent}% => ${$pageStats.newLpSharePercent}`}</p>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={addLiquidity} text="Confirm Add Supply" />
        </div>
    </div>
</div>

<div class="modal-sub-box">
    By adding liquidity you'll earn 0.3% of all trades on the pair proportional to your share of the pool. 
    Fees added to the pool accrue in real time and can be reclaimed by withdrawing your liquidity.
</div>
