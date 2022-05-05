<script>
    import { onMount, getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';

    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import LamdenLogo from '../../icons/lamden-logo.svelte'
    import DirectionalArrow from '../../icons/directional-arrow.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { rocketState, slippageTolerance, rswpBalance } from '../../store'
    import { stringToFixed, toBigNumber } from '../../utils'
    import { config } from '../../config'

    //Props
    export let closeConfirm;

    const { pageStats, resetPage, pageStores } = getContext('pageContext')
    const { quoteCalc  } = $pageStats
    const { selectedToken, currencyAmount, tokenAmount, buy, payInRswp  } = pageStores

    let logoSize = "30px"

    $: minimumReceived = $buy ? $payInRswp ? $pageStats.minimumTokens : $pageStats.minimumTokensLessFee : $payInRswp ? $pageStats.minimumCurrency : $pageStats.minimumCurrencyLessFee;
    $: slots = createSlots($buy, $currencyAmount, $tokenAmount, $payInRswp)
    $: receivedSymbol = $buy ? $selectedToken.token_symbol : config.currencySymbol
    $: slippage = buy ? $pageStats.tokenSlippage : $pageStats.currencySlippage
    $: percentOfTolerance = slippage.dividedBy($slippageTolerance)
    $: slippageWarning = slippage.isGreaterThan(5)
    $: canPayInRSWP = $rswpBalance.isGreaterThan(0) && $payInRswp
    $: rswpFee = canPayInRSWP ? $pageStats.rswpFee : null

    onMount(() => {
        rocketState.set(1)
    })

    const createSlots = () => {
        let slotArray = [
            {
                logoComponent: LamdenLogo,
                symbol: config.currencySymbol,
                amount: stringToFixed($currencyAmount, 8)
            },
            {
                logoComponent: TokenLogo,
                symbol: $selectedToken.token_symbol,
                amount: stringToFixed($tokenAmount, 8)
            },
        ]
        if ($buy) {
            slotArray[1].amount = stringToFixed(canPayInRSWP ? $pageStats.tokensPurchased : $pageStats.tokensPurchasedLessFee, 8)
        }else{
            slotArray[0].amount = stringToFixed(canPayInRSWP ? $pageStats.currencyPurchased : $pageStats.currencyPurchasedLessFee, 8)
            slotArray.reverse(); 
        }
        return slotArray;
    }

    let loading = false;

    const success = () => {
        finish();
        setTimeout(() => rocketState.set(2), 500)
        resetPage();
        closeConfirm();
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

    const swapBuy = () => {
        if (!$currencyAmount) return
        loading = true;
        walletService.swapBuy({
            'contract': $selectedToken.contract_name,
            'currency_amount': {'__fixed__': stringToFixed($currencyAmount, 8)},
            'minimum_received': {'__fixed__': stringToFixed(minimumReceived, 8)},
            'token_fees': canPayInRSWP
        }, $selectedToken, $currencyAmount, rswpFee, { success, error })
    }

    const swapSell = () => {
        if (!$tokenAmount) return
        loading = true;
        walletService.swapSell({
            'contract': $selectedToken.contract_name,
            'token_amount': {'__fixed__': stringToFixed($tokenAmount, 8)},
            'minimum_received': {'__fixed__': stringToFixed(minimumReceived, 8)},
            'token_fees': canPayInRSWP
        }, $selectedToken, $tokenAmount, rswpFee, { success, error })
    }
</script>


<style>
    .modal-style{
        max-width: 400px;
    }
    .sub-text{
        margin: 1rem 0;
        width: 90%;
    }

    .modal-confirm-details-box{
        padding-top: 1rem;
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
        <span class="text-large">Confirm Swap</span>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="flex-col text-xlarge">
        <div class="flex-row flex-center-spacebetween amount-row">
            <div class="flex-row flex-center-spacebetween">
                <svelte:component 
                    this={slots[0].logoComponent} 
                    tokenMeta={$selectedToken}
                    width={logoSize} 
                    margin="0 10px 0 0"
                />
                <span>{stringToFixed(slots[0].amount, 8)}</span>
            </div>
            <span>{slots[0].symbol}</span>
        </div>
        <DirectionalArrow direction="down" width="20px" margin="0.5rem 0 0 5px" color="var(--text-primary-color-dimmer)"/>
        <div class="flex-row flex-center-spacebetween amount-row">
            <div class="flex-row flex-center-spacebetween">
                <svelte:component 
                    this={slots[1].logoComponent}
                    tokenMeta={$selectedToken}
                    width={logoSize} 
                    margin="0 10px 0 0"
                />
                <span>{stringToFixed(slots[1].amount, 8)}</span>
            </div>
            <span>{slots[1].symbol}</span>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dim">
        ** Output is estimated. You will receive at least {stringToFixed(minimumReceived, 8)} {receivedSymbol} or the transaction will revert.
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Price</p>
            {#if $buy}
                <span>{`${stringToFixed($pageStats.newPrices.currency, 8)} ${$selectedToken.token_symbol} per ${config.currencySymbol}`}</span>
            {:else}
                <span>{`${stringToFixed($pageStats.newPrices.token, 8)} ${config.currencySymbol} per ${$selectedToken.token_symbol}`}</span>
            {/if}
        </div>

        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Price Impacted</p>
            <p 
                class:text-warning={slippage.isFinite() && percentOfTolerance.isGreaterThanOrEqualTo(0.75)}
                class:text-error={slippage.isFinite() && slippage.isGreaterThanOrEqualTo($slippageTolerance)}>
                {`${stringToFixed(slippage, 2)}%`}
            </p>
        </div>
        <div class="flex-row flex-align-center modal-confirm-item">
            <p class="text-primary-dim">Fee</p>
            {#if canPayInRSWP}
                <span>{`${stringToFixed($pageStats.rswpFee, 8)} ${config.ammTokenSymbol}`}</span>
            {:else}
                <span>{`${stringToFixed($pageStats.fee, 8)} ${receivedSymbol}`}</span>
            {/if}
        </div>
        <div class="flex-row modal-confirm-item">
            <p class="text-bold text-primary-dim">Minimum Recieved</p>
            <span>{`${stringToFixed(minimumReceived, 8)} ${receivedSymbol}`}</span>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={$buy ? swapBuy : swapSell} text="LAUNCH" />
        </div>
    </div>
</div>