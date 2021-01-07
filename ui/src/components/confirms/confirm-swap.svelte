<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';

    //Icons
    import Base64SvgLogo from '../../icons/base64_svg.svelte'
    import LamdenLogo from '../../icons/lamden-logo.svelte'
    import DirectionalArrow from '../../icons/directional-arrow.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, toBigNumber } from '../../utils'
    import { config } from '../../config'

    //Props
    export let selectedToken;
    export let currencyAmount;
    export let tokenAmount;
    export let buy;
    export let closeConfirm;

    const { pageStats, resetPage } = getContext('pageContext')

    let logoSize = "30px"
    let minimumReceived = toBigNumber("0.0")
    
    $: minimumReceivedString = stringToFixed(minimumReceived.toString(), 4)
    $: slots = createSlots(buy)
    $: receivedSymbol = buy ? selectedToken.token_symbol : config.currencySymbol
    $: slippage = buy ? $pageStats.tokenSlippage : $pageStats.currencySlippage
    $: slippageWarning = slippage.isGreaterThan(5)

    const createSlots = () => {
        let slotArray = [
            {
                logoComponent: LamdenLogo,
                symbol: config.currencySymbol,
                amount: stringToFixed(currencyAmount, 4)
            },
            {
                logoComponent: Base64SvgLogo,
                symbol: selectedToken.token_symbol,
                amount: stringToFixed(tokenAmount, 4)
            },
        ]
        if (!buy) {
            minimumReceived = $pageStats.currencyPurchasedLessFee
            slotArray[0].amount = stringToFixed(minimumReceived, 4)
            slotArray.reverse();
        }else{
            minimumReceived = $pageStats.tokensPurchasedLessFee
            slotArray[1].amount = stringToFixed(minimumReceived, 4)
        }
        return slotArray;
    }

    let loading = false;

    const success = () => {
        loading = false;
        closeConfirm()
        resetPage()
    }

    const error = () => {
        loading = false;
    }

    const swapBuy = () => {
        if (!currencyAmount) return
        loading = true;
        walletService.swapBuy({
        'contract': selectedToken.contract_name,
        'currency_amount': {'__fixed__': stringToFixed(currencyAmount.toString(), 30)}
        }, selectedToken, currencyAmount, minimumReceived, { success, error })
    }

    const swapSell = () => {
        if (!tokenAmount) return
        loading = true;
        walletService.swapSell({
        'contract': selectedToken.contract_name,
        'token_amount': {'__fixed__': stringToFixed(tokenAmount.toString(), 30)}
        }, selectedToken, minimumReceived, tokenAmount, { success, error })
    }

</script>


<style>
    .modal-style{
        width: 330px;
    }
    .sub-text{
        margin: 1rem 0;
        width: 90%;
    }

    .modal-confirm-details-box{
        padding-top: 1rem;
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
                    string={selectedToken.logo_svg_base64}
                    width={logoSize} 
                    margin="0 10px 0 0"
                />
                <span>{slots[0].amount}</span>
            </div>
            <span>{slots[0].symbol}</span>
        </div>
        <DirectionalArrow direction="down" width="20px" margin="0 0 0 5px" color="var(--text-primary-color-dimmer)"/>
        <div class="flex-row flex-center-spacebetween amount-row">
            <div class="flex-row flex-center-spacebetween">
                <svelte:component 
                    this={slots[1].logoComponent}
                    string={selectedToken.logo_svg_base64}
                    width={logoSize} 
                    margin="0 10px 0 0"
                />
                <span>{slots[1].amount}</span>
            </div>
            <span>{slots[1].symbol}</span>
        </div>
    </div>
    <p class="text-xsmall sub-text text-primary-dim">
        ** Output is estimated. <!--You will receive at least {minimumReceivedString} {receivedSymbol} or the transaction will revert.-->
    </p>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Price</p>
            {#if buy}
                <div class="flex-row flex-align-center">
                    <span class="number margin-r-3">{stringToFixed($pageStats.newPrices.currency, 8)}</span>
                    <span>{`${selectedToken.token_symbol} per ${config.currencySymbol}`}</span>
                </div>
            {:else}
                <div class="flex-row flex-align-center">
                    <span class="number margin-r-3">{stringToFixed($pageStats.newPrices.token, 8)}</span>
                    <span>{`${config.currencySymbol} per ${selectedToken.token_symbol}`}</span>
                </div>
            {/if}
        </div>
        <!--
        <div class="flex-row modal-confirm-item">
            <p>Minimum Recieved</p>
            <p class="text-bold">{minimumReceivedString} {receivedSymbol}</p>
        </div>
        -->
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Price Impacted</p>
            <p  class="number" 
                class:text-warning={slippage.isLessThan(5)}
                class:text-error={slippage.isGreaterThanOrEqualTo(5)}
            >
                {`${stringToFixed(slippage, 2)}%`}
            </p>
        </div>
        <div class="flex-row flex-align-center modal-confirm-item">
            <p class="text-primary-dim">Liquidity Provider Fee</p>
            <div class="flex-row flex-align-center">
                <span class="number margin-r-3">{stringToFixed($pageStats.fee, 8)}</span>
                <span>{receivedSymbol}</span>
            </div>
            
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={buy ? swapBuy : swapSell} text="Confirm Swap" />
        </div>
    </div>
</div>