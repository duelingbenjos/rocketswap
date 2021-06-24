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
        data.map(d => {
            if (!d.PercentPriceIncrease_24h) d.PercentPriceIncrease_24h = toBigNumber(0)
            if (!d.Last) d.Last = toBigNumber(0)
            if (!d.BaseVolume) d.BaseVolume = toBigNumber(0)
            d.usdPrice = d.Last.multipliedBy($tauUSDPrice)
            if (d.usdPrice.isLessThan(toBigNumber("0.000000001"))) d.remove = true
            d.usdVolume = d.BaseVolume.multipliedBy($tauUSDPrice)

            d.tauLiquidity = d.reserves[0].multipliedBy(2)
            d.usdLiquidity = d.tauLiquidity.multipliedBy($tauUSDPrice)
            
            return d
        })

        marketData = data.filter(f => !f.remove)
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

<style>
    .page-container{
        padding-bottom: 10rem;
    }
    .header{
        margin: 0 auto 2rem;
        max-width: 850px;
        font-weight: 200;
    }
    span > a {
        text-decoration: none;
    }
    span > a:hover {
        text-decoration: underline;
    }
    span > a:visited{
        color: var(--text-color-highlight);
    }
</style>

<div class="page-container"  >
    <div class="header text-xxlarge">
        <span>
            Rocketswap is a community developed Automated Market Maker for exchanging digital assets. 
            <a href="https://rocketswap.exchange/docs/#/" class="text-color-highlight"  rel="noopener noreferrer" target="_blank"> Learn More</a>
        </span>
    </div>
    {#if $currencyType && homePageTableFilter}
	    <HomePanel {marketData}/>
    {/if}
    <TradeRockets {marketData}/>
</div>