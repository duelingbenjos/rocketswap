<script>
    import TradeRocket from './trade-rocket.svelte'

    // Misc
    import { allTradeUpdates } from '../../store'

    export let marketData;

    let rockets = []
    let rocketLauncher
    let timer;

    allTradeUpdates.subscribe(update => {
        if (!Array.isArray(update)) return
        if (update.length === 0) return
        if (!rocketLauncher) return
        launchRocket(update[update.length - 1])
    })

    function launchRocket(tradeUpdate){
        let marketInfo = marketData.find(f => f.contract_name === tradeUpdate.contract_name)
        let tokenMeta = {}
        if (marketInfo) tokenMeta = marketInfo.token
        const element = new TradeRocket({
            target: rocketLauncher,
            props: {
                tradeType: tradeUpdate.type,
                tokenMeta
            }
        })
    }
</script>

<style>
    .launcher{
        position: absolute;
        box-sizing: border-box;
        overflow: hidden;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        z-index: -1;
    }
</style>

<div class="launcher" bind:this={rocketLauncher} />

