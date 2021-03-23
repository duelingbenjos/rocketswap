<script>
    import { getContext } from 'svelte';
    
    // MISC
    import { stringToFixed } from '../../utils'

    //Props
    export let currencyPrice;
    export let tokenPrice;

    const { pageStats, resetPage, pageStores } = getContext('pageContext');
    const { selectedToken } = pageStores

</script>

<div class="flex-row modal-confirm-item">
    <p class="text-primary-dim">Rates</p>
    <div class="flex-col rates">
        <div class="rate flex-row flex-align-center">
            <span >{`1 TAU = ${stringToFixed(currencyPrice, 8)} ${$selectedToken.token_symbol}`}</span>
        </div>
        <div class="rate flex-row flex-align-center">
            <span >{`1 ${$selectedToken.token_symbol} = ${stringToFixed(tokenPrice, 8)} TAU`}</span>
        </div>
    </div>
</div>