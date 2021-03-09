<script>
    import BoxedMsg from './boxed-message.svelte'
    import PoolCreateLiquidityButton from './pool-create_liquidity_button.svelte'
    import PoolsChart from './pool-pools_chart.svelte'

    let liquidityMessage = {
        title: "Liquidity provider rewards",
        messages: [
            "Liquidity providers earn a 0.3% fee on all trades proportional to the their share of the pool.", 
            "Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
        ]
    }
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
    <BoxedMsg title={liquidityMessage.title} messages={liquidityMessage.messages}/>
    <PoolCreateLiquidityButton />
    <PoolsChart />
</main>
