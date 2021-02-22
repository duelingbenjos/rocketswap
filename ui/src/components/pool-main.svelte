<script>
    import PoolLiquidityMsg from './pool-liqudity_msg.svelte'
    import PoolCreateLiquidityButton from './pool-create_liquidity_button.svelte'
    import PoolsChart from './pool-pools_chart.svelte'
</script>

<style>
    main{
        max-width: 750px;
        margin-bottom: 6rem;
    }

    @media screen and (min-width: 430px) {
        main{
            padding: 20px;
        }
    }
</style>

<main>
    <PoolLiquidityMsg />
    <PoolCreateLiquidityButton />
    <PoolsChart />
</main>
