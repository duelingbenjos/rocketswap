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
    import { stringToFixed, toBigNumber } from '../utils'

    let marketData = [];
    let timer;
    let joinedFeeds = []

    async function getData(){
        let data = await apiService.get_market_summaries()
        console.log(data)
        data.map(d => {
            if (!d.PercentPriceIncrease_24h) d.PercentPriceIncrease_24h = toBigNumber(0)
            if (!d.Last) d.Last = toBigNumber(0)
            if (!d.BaseVolume) d.BaseVolume = toBigNumber(0)
            d.usdPrice = d.Last.multipliedBy($tauUSDPrice)
            d.usdVolume = d.BaseVolume.multipliedBy($tauUSDPrice)

            d.tauLiquidity = d.reserves[0].multipliedBy(2)
            d.usdLiquidity = d.tauLiquidity.multipliedBy($tauUSDPrice)
            
            return d
        })
        marketData = data
        console.log({marketData})
    }

    onMount(() => {
        getData()
        setInterval(getData, 60000)
        wsService.joinTradeFeed('global')
        return () => {
            console.log("leaving feeds")
            clearInterval(timer)
            joinedFeeds.map(contract_name => wsService.leaveTradeFeed('global'))
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