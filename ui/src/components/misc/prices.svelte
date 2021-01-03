<script lang="ts">
    import { getContext } from 'svelte'

    //Misc
    import { stringToFixed, quoteCalculator } from '../../utils' 
    import { config } from '../../config'

    export let pageState;
    export let label = "Price:"

    const { pageStats } = getContext('pageContext');

    $: tokenSymbol = pageState?.selectedToken?.token_symbol || "-";
</script>

<style>
    .container{
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 20px;
        font-size: var(--text-size-small);

        flex-wrap: wrap;
        margin: 1rem 0;
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
        <p>{`1 ${tokenSymbol} = ${$pageStats?.quoteCalc?.prices ? stringToFixed($pageStats.quoteCalc.prices.currency, 8) : "0.0"} ${config.currencySymbol}`}</p>
        <p>{`1 ${config.currencySymbol} = ${$pageStats?.quoteCalc?.prices ? stringToFixed($pageStats.quoteCalc.prices.token, 8) : "0.0"} ${tokenSymbol}`}</p>
    </div>
</div>