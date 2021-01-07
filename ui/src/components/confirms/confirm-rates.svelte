<script>
    //Props
    export let currencyPrice;
    export let tokenPrice;
    export let selectedToken;
</script>

<div class="flex-row modal-confirm-item">
    <p class="text-primary-dim">Rates</p>
    <div class="flex-col rates">
        <div class="rate flex-row flex-align-center">
            <span class="number">1</span>
            <span >TAU</span>
            <span class="equals">= </span>
            <span class="number">{currencyPrice}</span>
            <span >{selectedToken.token_symbol}</span>
        </div>
        <div class="rate flex-row flex-align-center">
            <span class="number">1</span>
            <span class="equals">{selectedToken.token_symbol} = </span>
            <span class="number">{tokenPrice}</span>
            <span>TAU</span>
        </div>
    </div>
</div>