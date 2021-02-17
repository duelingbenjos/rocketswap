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
        max-height: 16vh;
        max-width: 430px;
        margin: 1rem auto 0;
        opacity: 0.8;
        -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    }

    .trade-table:hover{
        opacity: 1;
    }

    .trade-table::-webkit-scrollbar {
        display: none;
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