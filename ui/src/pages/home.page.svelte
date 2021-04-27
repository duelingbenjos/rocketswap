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
    import { tauUSDPrice, currencyType } from '../store'
    import { stringToFixed } from '../utils'

    let marketData;
    let timer;
    let joinedFeeds = []

    async function getData(){
        let data = await apiService.get_market_summaries_with_token_info()
        data.map(d => {
            let vol24Str =  calc24PricePercent(d.PrevDay, d.Last)
            d.vol24Str = vol24Str
            if (vol24Str.includes('-')) d.change = "minus"
            if (vol24Str.includes('+')) d.change = "plus"
            if (vol24Str === '+0%') d.change = "even"
            d.usdPrice = d.Last.multipliedBy($tauUSDPrice)
            d.usdVolume = d.Volume.multipliedBy(d.Last).multipliedBy($tauUSDPrice)

            if (!joinedFeeds.includes(d.contract_name)){
                wsService.joinTradeFeed(d.contract_name)
                joinedFeeds.push(d.contract_name)
                console.log(joinedFeeds)
            }
            return d
        })
        marketData = data
    }

    const calc24PricePercent  = (prevDayPrice, lastPrice) => {
        let change = lastPrice.dividedBy(prevDayPrice).multipliedBy(100)
        if (change.isEqualTo(100)) return `+0%`
        if (change.isGreaterThan(100)) return `+${stringToFixed(change.minus(1).toFixed(2), 2)}%`
        change = prevDayPrice.dividedBy(lastPrice).multipliedBy(100)
        return `-${stringToFixed(change.minus(1).toFixed(2), 2)}%`
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
    {#if $currencyType}
	    <HomePanel {marketData}/>
    {/if}
    <TradeRockets {marketData}/>
</div>