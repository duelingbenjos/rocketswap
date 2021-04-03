<script>
    import { getContext } from 'svelte'
    import { fade } from 'svelte/transition';

    //Components
    import Trade from './trade.svelte'

    //Misc
    import { tradeHistory, tradeUpdates } from '../../store'

    const { pageStores } = getContext('pageContext')
    const { selectedToken } = pageStores

    $: contract_trades = $tradeHistory[$selectedToken.contract_name] || []
    $: contract_trades_updates = $tradeUpdates[$selectedToken.contract_name] || []

</script>

<style>
    .trade-table{
        display: none;
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

    @media screen and (min-width: 650px) {
        .trade-table {
            display: flex;
        }
    }
</style>


<div class="trade-table flex-col">
    <div class="flex-col-reverse">
        {#each contract_trades_updates as trade}
            <div in:fade={{duration: 500}}>
                <Trade {trade} />
            </div>
        {/each} 
    </div>

    {#each contract_trades as trade}
        <div in:fade={{duration: 500}}>
            <Trade {trade} />
        </div>
    {/each} 
</div>