<script lang="ts">
    import { getContext } from 'svelte'

    // Components
    import Modal from './modal.svelte'
    import PopupChangeSlippage from './popup-change-slippage.svelte'

    // Misc
    import { stringToFixed, quoteCalculator, toBigNumber} from '../../utils' 
    import { config } from '../../config'
    import { slippageTolerance } from '../../store'

    const { pageStats, pageStores } = getContext('pageContext');
    const { selectedToken, buy, currencyAmount, tokenAmount, tokenLP } = pageStores

    let openChangeSlippage = false;

    pageStats.subscribe(val => console.log(val))

    $: tokenSymbol = $selectedToken?.token_symbol || "???";
    $: slippage = $buy ?  $pageStats.currencySlippage : $pageStats.tokenSlippage;
    $: slippageDisplay = slippage.isFinite() ? stringToFixed(slippage, 2) :  "0.0";
    $: feeDisplay = isNaN($pageStats?.fee) ? "0.0" : $pageStats?.fee;
    $: percentOfTolerance = slippage.dividedBy($slippageTolerance)
    $: minimumReceived = $buy ? $pageStats.minimumTokens : $pageStats.minimumCurrency;


    const toggleChangeSlippageModal = () => {
        if (openChangeSlippage) openChangeSlippage = false
        else openChangeSlippage = true
    }
</script>

<style>
    .container{
        border: 1px solid var(--box-border-color);
        border-radius: var(--border-radius);
        padding: 0.5rem 20px;
        flex-wrap: wrap;
        margin: 0 0 1rem;
    }
    .flex-row{
        justify-content: space-between;
    }
    span > button {
        position: relative;
        top: -1.5px;
        margin-left: 8px;
    }
</style>

<div class="container container-border flex-col text-xsmall weight-400">
    <div class="flex-row flex-align-center">
        <span class="text-primary-dim">Price</span>
        {#if $buy}
            <div class="flex-row flex-align-center">
                <span class="number margin-r-3">
                    {stringToFixed($pageStats?.newPrices?.currency, 8)}
                </span>
                <span>{` ${tokenSymbol} per  ${config.currencySymbol}`}</span>
            </div>
        {:else}
            <div class="flex-row flex-align-center">
                <span class="number margin-r-3">
                    {stringToFixed($pageStats?.newPrices?.token, 8)}
                </span>
                <span>{` ${config.currencySymbol} per ${tokenSymbol}`}</span>
            </div>
        {/if}
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Price Impact</span>
        <span class="number"
              class:text-warning={slippage.isFinite() && percentOfTolerance.isGreaterThanOrEqualTo(0.75)}
              class:text-error={slippage.isFinite() && slippage.isGreaterThanOrEqualTo($slippageTolerance)}>
                {`${slippageDisplay}%`}
        </span>
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Fee</span>
        <div class="flex-row flex-align-center">
            <span class="number margin-r-3">{stringToFixed(feeDisplay, 8)}</span>
            <span>{$buy ?  tokenSymbol : config.currencySymbol}</span>
        </div>
    </div>
     <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Slippage Tolerance</span>
        <span> {stringToFixed($slippageTolerance, 2)}%
            <button 
                class="primary small" 
                on:click={toggleChangeSlippageModal}>
                change
            </button>
        </span>
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Guaranteed Minimum</span>
        <div class="flex-row flex-align-center">
            <span class="number margin-r-3">
                {stringToFixed(minimumReceived, 8)}
            </span>
            <span>{$buy ?  tokenSymbol : config.currencySymbol}</span>
        </div>
    </div>
</div>

<Modal toggleModal={toggleChangeSlippageModal} open={openChangeSlippage}>
    <div slot="main-centered">
        <PopupChangeSlippage toggleModal={toggleChangeSlippageModal}/>
    </div>
</Modal>