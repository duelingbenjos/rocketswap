<script>
    import { onMount } from 'svelte'

    // Components
    import HomePanel from '../components/panels/home-panel.svelte'
    import TradeRockets from '../components/misc/trade-rockets.svelte'
    import TradeRocket from '../components/misc/trade-rocket.svelte'

    // Services
	import { ApiService } from '../services/api.service'
    const apiService = ApiService.getInstance();
    import { WsService } from '../services/ws.service'
	const wsService = WsService.getInstance()
    
    // Misc
    import { tauUSDPrice, currencyType, homePageTableFilter } from '../store'
    import { stringToFixed } from '../utils'

    let marketData;
    let timer;
    let joinedFeeds = []

    async function getData(){
        let data = await apiService.get_market_summaries()
        data.map(d => {
            if (d.PercentPriceIncrease_24h.isEqualTo(0)) {
                d.price24Str = `+0`
                d.change = "even"
            }
            if (d.PercentPriceIncrease_24h.isGreaterThan(0)) {
                d.price24Str = `+${stringToFixed(d.PercentPriceIncrease_24h.toFixed(2), 2)}`
                d.change = "plus"
            }
            if (d.PercentPriceIncrease_24h.isLessThan(0)) {
                d.price24Str = `${stringToFixed(d.PercentPriceIncrease_24h.toFixed(2), 2)}`
                d.change = "minus"
            }

            d.usdPrice = d.Last.multipliedBy($tauUSDPrice)
            d.usdVolume = d.Volume.multipliedBy(d.Last).multipliedBy($tauUSDPrice)

            if (!joinedFeeds.includes(d.contract_name)){
                wsService.joinTradeFeed(d.contract_name)
                joinedFeeds.push(d.contract_name)
            }
            return d
        })
        marketData = data
    }

    onMount(() => {
        getData()
        setInterval(getData, 60000)
        return () => {
            console.log("leaving feeds")
            clearInterval(timer)
            joinedFeeds.map(contract_name => wsService.leaveTradeFeed(contract_name))
            joinedFeeds = []
        }
    })

</script>

<div class="page-container"  >
    {#if $currencyType && homePageTableFilter}
	    <HomePanel {marketData}/>
    {/if}
    <TradeRockets {marketData}/>
</div>