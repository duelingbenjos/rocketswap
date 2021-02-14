<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition';

    //Components
    import Trade from './trade.svelte'

    //Misc
    import { tradeHistory, tradeUpdates } from '../../store'

    onMount(() => {
        //setInterval(pushTrades, 10000)
    })
    const pushTrades = () => {
        tradeUpdates.update(trades => {
            trades.push({
                type: "buy",
                amount: "27306.5924",
                token_symbol: "LAMA",
                price: "0.0038",
                time: 1613077744
            })
            return trades
        })
    }
</script>

<style>
    .trade-table{
        overflow-y: auto;
        height: 100%;
        max-height: 30vh;
        max-width: 500px;
        margin: 1rem auto 0;
        opacity: 0.7;
        -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    }

    .trade-table:hover{
        opacity: 1;
    }

    .trade-table::-webkit-scrollbar {
        width: 10px;
    }
    /* Track */

    .trade-table::-webkit-scrollbar-track {
        -webkit-box-shadow: none;
    }
    /* Handle */

    .trade-table::-webkit-scrollbar-thumb {
        -webkit-box-shadow: none;
        border-radius: 99px;
        background: transparent;
        border: 2px solid #ffffffaf;
    }

    .trade-table::-webkit-scrollbar-thumb:window-inactive {
        background: transparent;
        border: 2px solid #ffffffaf;
    }
        .trade-table::-webkit-scrollbar-thumb:hover {
        background: #ffffff;
        border: 2px solid #ffffff;
    }

    @media screen and (max-width: 800px) {
        .trade-table {
            display: none;
        }
    }
</style>


<div class="trade-table flex-col">
    <div class="flex-col-reverse">
        {#each $tradeUpdates as trade}
            <div in:fade={{duration: 500}}>
                <Trade {trade} />
            </div>
        {/each} 
    </div>

    {#each $tradeHistory as trade}
        <div in:fade={{duration: 500}}>
            <Trade {trade} />
        </div>
    {/each} 
</div>