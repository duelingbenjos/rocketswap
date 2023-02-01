<script>
    import { onMount } from 'svelte'

    // Components
    import HomePanel from '../components/panels/home-panel.svelte'
    import TradeRockets from '../components/misc/trade-rockets.svelte'
    import OnBoarding from '../components/onboarding/onboarding-messages.svelte'
    import HomeFilters from '../components/home-page/homeFilters.svelte'

    // Services
	import { ApiService } from '../services/api.service'
    const apiService = ApiService.getInstance();
    import { WsService } from '../services/ws.service'
	const wsService = WsService.getInstance()
    
    // Misc
    import { tauUSDPrice, currencyType, homePageTableFilter, homeFilters, verifiedTokens } from '../store'
    import { toBigNumber } from '../utils'

    let marketData = null;
    $: filteredData = applyFilters(marketData, $homeFilters, $verifiedTokens)
    let timer;

    onMount(() => {
        getData()
        setInterval(getData, 60000)
        wsService.joinTradeFeed('global')
        return () => {
            clearInterval(timer)
            wsService.leaveTradeFeed('global')
        }
    })

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

    function applyFilters(data, filters, verifiedTokens){
        if (data === null) return null
        if (!filters) return data
        if (!filters.showLowLiquidity){
            data = data.filter(f => f.usdLiquidity.isGreaterThan(1000))
        }
        if (!filters.showLowVolume){
            data = data.filter(f => f.usdVolume.isGreaterThan (500))
        }
        if (!filters.showNotVerified){
            data = data.filter(f => verifiedTokens.includes(f.contract_name))
        }
        if (filters.search){
            let search = filters.search.toLowerCase()
            data = data.filter(f => f.token.token_name.toLowerCase().includes(search) || f.token.token_symbol.toLowerCase().includes(search))
        }
        return data
    }

</script>

<style>
    .page-container{
        padding-bottom: 10rem;
    }
</style>

<div class="page-container"  >
    <OnBoarding type={"home_info"} />
    <HomeFilters />
    
    {#if $currencyType && homePageTableFilter}
	    <HomePanel marketData={filteredData}/>
    {/if}
    <TradeRockets {marketData}/>
</div>