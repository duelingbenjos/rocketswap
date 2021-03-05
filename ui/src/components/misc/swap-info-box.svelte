<script lang="ts">
    import { getContext } from 'svelte'

    // Components
    import Modal from './modal.svelte'
    import PopupChangeSlippage from './popup-change-slippage.svelte'

    // Misc
    import { stringToFixed, quoteCalculator, toBigNumber, setPayInRswp} from '../../utils' 
    import { config } from '../../config'
    import { slippageTolerance, rswpPrice, payInRswp } from '../../store'

    const { pageStats, pageStores } = getContext('pageContext');
    const { selectedToken, buy, currencyAmount, tokenAmount, tokenLP } = pageStores

    let openChangeSlippage = false;

    $: tokenSymbol = $selectedToken?.token_symbol || "???";
    $: pricePaid = $pageStats.pricePaid ? $pageStats.pricePaid : $buy ? $pageStats?.newPrices?.currency : $pageStats?.newPrices?.token;
    $: slippage = $buy ?  $pageStats.currencySlippage : $pageStats.tokenSlippage;
    $: slippageDisplay = slippage.isFinite() ? stringToFixed(slippage, 2) :  "0.0";
    $: feeDisplay = isNaN($pageStats?.fee) ? "0.0" : $pageStats?.fee;
    $: rswpFeeDisplay = isNaN($pageStats?.rswpFee) ? "0.0" : $pageStats?.rswpFee;
    $: percentOfTolerance = slippage.dividedBy($slippageTolerance)
    $: minimumReceived = $buy ? $payInRswp ? $pageStats.minimumTokens : $pageStats.minimumTokensLessFee : $payInRswp ? $pageStats.minimumCurrency : $pageStats.minimumCurrencyLessFee;
    $: checked = $payInRswp


    const toggleChangeSlippageModal = () => {
        if (openChangeSlippage) openChangeSlippage = false
        else openChangeSlippage = true
    }

    const handleCheckChange = () => {
        setPayInRswp(checked)
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
    .fee{
        display: flex;
        flex-direction: row;
    }
    label.pay-in-rswp{
        color: var(--color-primary);
    }
    button.small{
        padding: 0px 5px;
        margin: 0.25rem 0 0.25rem 4px;
    }
    .chk-small{
        top: 3px;
        margin-left: 2px;
        height: 11px;
        width: 11px;
        border-radius: 3px;
        border: 1px solid var(--checkbox-border);
    }
    .chk-small::after{
        left: 3px;
        top: -0.5px;
        width: 3px;
        height: 7px;
        border: solid var(--checkbox-checkmark);
        border-width: 0 2px 2px 0;
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
        <div class="flex-row flex-align-center">
            <span class="number margin-r-3 number-span">
                {stringToFixed(pricePaid, 8)}
            </span>
            {#if $buy}
                <span>{` ${tokenSymbol} per  ${config.currencySymbol}`}</span>
            {:else}
                <span>{`${config.currencySymbol} per ${tokenSymbol}`}</span>
            {/if}
        </div>
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Price Impact</span>
        <span class="number"
              class:text-warning={slippage.isFinite() && percentOfTolerance.isGreaterThanOrEqualTo(0.75)}
              class:text-error={slippage.isFinite() && slippage.isGreaterThanOrEqualTo($slippageTolerance)}>
                {`${slippageDisplay}%`}
        </span>
    </div>
    <div class="flex-row flex-align-start flex-justify-start">
        <span class="text-primary-dim">Fee</span>
        <div class="flex-col" >
            <div class="fee flex-center-end">
                {#if $payInRswp}
                    <span class="number margin-r-3 number-span">{stringToFixed(rswpFeeDisplay, 8)}</span>
                    <span>{config.ammTokenSymbol}</span>
                {:else}
                    <span class="number margin-r-3 number-span">{stringToFixed(feeDisplay, 8)}</span>
                    <span>{$buy ?  tokenSymbol : config.currencySymbol}</span>
                {/if}
            </div>
            <label class="flex-row chk-container text-primary-dim" class:pay-in-rswp={$payInRswp} id="chk-all">
                Pay fee with RSWP
                <input  type="checkbox" bind:checked on:change={handleCheckChange}>
                <span  class="chk-checkmark chk-small"></span>
            </label>
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
            <span class="number margin-r-3 number-span">
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