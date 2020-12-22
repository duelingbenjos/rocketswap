<script>
    import PoolLiquidityMsg from './pool-liqudity_msg.svelte'
    import PoolCreateLiquidity from './pool-create_liquidity.svelte'
    import PoolsChart from './pool-pools_chart.svelte'
</script>

<style>
    main{
        max-width: 750px;
        color: #fff;
    }
</style>

<main>
    <PoolLiquidityMsg />
    <PoolCreateLiquidity />
    <PoolsChart />
</main>
