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

    let marketData;
    let timer;
    let joinedFeeds = []

    async function getData(){
        let data = await apiService.get_market_summaries()
        data.map(d => {
            d.usdPrice = d.Last.multipliedBy($tauUSDPrice)
            d.usdVolume = d.BaseVolume.multipliedBy($tauUSDPrice)
            return d
        })
        marketData = data
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