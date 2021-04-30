<script>
    import { onMount, afterUpdate } from 'svelte'

    // Components
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

    onMount(() => {
        //launchRocketsTest()
        //setInterval(launchRocketsTest, 4000)
    })

    const launchRocketsTest = () => {
        launchRocket({
            "action":"trade_update",
            "type":"sell",
            "amount":"5",
            "contract_name":"con_rswp_lst001",
            "token_symbol":"RSWP",
            "price":"1.43789601",
            "time":1619574222,
            "hash":"88eb447edb5cc1be49907683ef4f7de57a485c0bc4dceb0ddc26db72a3ef47d8"
        })
        launchRocket({
            "action":"trade_update",
            "type":"buy",
            "amount":"5",
            "contract_name":"con_rswp_lst001",
            "token_symbol":"RSWP",
            "price":"1.43789601",
            "time":1619574222,
            "hash":"88eb447edb5cc1be49907683ef4f7de57a485c0bc4dceb0ddc26db72a3ef47d8"
        })
        }

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

