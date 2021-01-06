<script lang="ts">
    import { getContext } from 'svelte'

    //Misc
    import { stringToFixed, quoteCalculator } from '../../utils' 
    import { config } from '../../config'

    export let pageState;
    export let label = "Price"
    export let showAll =  false;

    const { pageStats } = getContext('pageContext');

    $: tokenSymbol = pageState?.selectedToken?.token_symbol || "-";
</script>

<style>
    .container{
        border: 1px solid var(--box-border-color);
        border-radius: var(--border-radius);
        padding: 0.5rem 20px;
        font-size: var(--text-size-small);

        flex-wrap: wrap;
        margin: 1rem 0 0;
    }
    p{
        margin: 0;
    }
    .prices{
        flex-grow: 1;
        align-items: flex-end;
    }
</style>

<div class="container container-border flex-row">
    <div class="flex-col label">
        <p>{label}</p>
    </div>
    <div class="flex-col prices">
        {#if showAll}
            <p>{`1 ${tokenSymbol} = ${stringToFixed($pageStats?.quoteCalc.prices.currency, 8)} ${config.currencySymbol}`}</p>
            <p>{`1 ${config.currencySymbol} = ${stringToFixed($pageStats?.quoteCalc.prices.token, 8)} ${tokenSymbol}`}</p>
        {:else}
            {#if pageState.buy}
                <p>{`${stringToFixed($pageStats?.quoteCalc.prices.currency, 8)} ${tokenSymbol} per  ${config.currencySymbol}`}</p>
            {:else}
                <p>{`${stringToFixed($pageStats?.quoteCalc.prices.token, 8)} ${config.currencySymbol} per ${tokenSymbol}`}</p>
            {/if}
        {/if}
    </div>
</div>