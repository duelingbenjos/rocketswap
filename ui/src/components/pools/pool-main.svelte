<script>
    import BoxedMsg from '../misc/boxed-message.svelte'
    import PoolCreateLiquidityButton from './pool-create_liquidity_button.svelte'
    import PoolsDisplay from './pool-pools-display.svelte'

    let liquidityMessage = {
        title: "Liquidity provider rewards",
        messages: [
            "Liquidity providers earn a 0.3% fee on all trades proportional to the their share of the pool.", 
            "Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
        ]
    }
</script>

<style>
    div{
        max-width: 1020px;
        margin-bottom: 6rem;
        margin: 0 auto;
    }

    @media screen and (min-width: 430px) {
        div{
            padding: 20px;
        }
    }
</style>

<div>
    <BoxedMsg title={liquidityMessage.title} messages={liquidityMessage.messages}/>
    <PoolCreateLiquidityButton />
    <PoolsDisplay />
</div>
