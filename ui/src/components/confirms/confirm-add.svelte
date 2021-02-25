<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';
    import ConfirmRates from './confirm-rates.svelte'
    import ShareChange from './confirm-share-change.svelte'

    //Icons
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, refreshLpBalances } from '../../utils'
    import { config } from '../../config'

    //Props
    export let closeConfirm;

    const { pageStats, resetPage, pageStores } = getContext('pageContext');
    const { selectedToken, currencyAmount, tokenAmount } = pageStores

    let loading = false;

    const success = () => {
        finish();
        setTimeout(refreshLpBalances, 2500)
        setTimeout(refreshLpBalances, 10000)
        resetPage();
        closeConfirm();
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

    const addLiquidity = () => {
        if (!$currencyAmount || !$tokenAmount || !$selectedToken) return
        loading = true;
        walletService.addLiquidity({
            'contract': $selectedToken.contract_name,
            'currency_amount': {'__fixed__': stringToFixed($currencyAmount.toString(), 30)}
        }, $selectedToken, $tokenAmount, $currencyAmount, { success, error })
    }

</script>


<style>
    .modal-style{
        max-width: 330px;
    }
    .modal-sub-box{
        width: 345px;
    }
    .sub-text{
        margin: 0.5rem 0;
    }
    @media screen and (min-width: 430px) {
        .modal-style{
            margin-top: 8rem;
        }
    }
</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You will receive</p>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <p class="text-xxlarge text-bold lp-amount margin-0">{stringToFixed($pageStats.lpToMint, 4)}</p>
    <p class="text-large margin-0 text-primary-dim">{`${$selectedToken.token_symbol} / ${config.currencySymbol} Pool Tokens`}</p>
    <p class="text-xsmall sub-text text-primary-dimmer">
        Output is estimated. If the price changes by more than 0.5% your transaction will revert.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">TAU Deposited</p>
            <p class="number">{stringToFixed($currencyAmount, 12)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">{`${$selectedToken.token_symbol} Deposited`}</p>
            <p class="number">{stringToFixed($tokenAmount, 12)}</p>
        </div>
        <ConfirmRates 
            currencyPrice={stringToFixed($pageStats.quoteCalc.prices.currency, 4)}
            tokenPrice={stringToFixed($pageStats.quoteCalc.prices.token, 4)}
            {$selectedToken}
        />
        <ShareChange />
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={addLiquidity} text="Confirm Add Supply" />
        </div>
    </div>
</div>

<div class="modal-sub-box">
    By adding liquidity you'll earn 0.3% of all trades on the pair proportional to your share of the pool. 
    Fees added to the pool accrue in real time and can be reclaimed by withdrawing your liquidity.
</div>
