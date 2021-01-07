<script lang="ts">
    import { getContext } from 'svelte'

    //Misc
    import { stringToFixed, quoteCalculator } from '../../utils' 
    import { config } from '../../config'

    export let pageState;

    const { pageStats } = getContext('pageContext');

    $: tokenSymbol = pageState?.selectedToken?.token_symbol || "-";
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
</style>

<div class="container container-border flex-col text-small weight-400">
    <div class="flex-row flex-align-center">
        <span class="text-primary-dim">Price</span>
        {#if pageState.buy}
            <div class="flex-row flex-align-center">
                <span class="number margin-r-3">{stringToFixed($pageStats?.newPrices?.currency, 8)}</span>
                <span>{` ${tokenSymbol} per  ${config.currencySymbol}`}</span>
            </div>
        {:else}
            <div class="flex-row flex-align-center">
                <span class="number margin-r-3">{stringToFixed($pageStats?.newPrices?.token, 8)}</span>
                <span>{` ${config.currencySymbol} per ${tokenSymbol}`}</span>
            </div>
        {/if}
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Fee</span>
        <div class="flex-row flex-align-center">
            <span class="number margin-r-3">{stringToFixed($pageStats?.fee, 8)}</span>
            <span>{pageState.buy ?  tokenSymbol : config.currencySymbol}</span>
        </div>
    </div>
    <div class="flex-row flex-align-center ">
        <span class="text-primary-dim">Slippage</span>
        <span class="number text-primary">{`${stringToFixed(pageState.buy ?  $pageStats.currencySlippage : $pageStats.tokenSlippage, 2)}%`}</span>
    </div>
</div>