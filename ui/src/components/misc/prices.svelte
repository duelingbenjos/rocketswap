<script lang="ts">
    import { config } from '../../config'

    //Misc
    import { stringToFixed, quoteCalculator } from '../../utils' 

    export let pageState;
    export let label = "Price:"

    console.log(pageState)

    $: prices = quoteCalculator(pageState?.tokenLP)?.prices || {currency: "0", token: "0"};
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
    .label{

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
        <p>{`1 ${tokenSymbol} = ${stringToFixed(prices?.currency, 8)} ${config.currencySymbol}`}</p>
        <p>{`1 ${config.currencySymbol} = ${stringToFixed(prices?.token, 8)} ${tokenSymbol}`}</p>
    </div>
</div>