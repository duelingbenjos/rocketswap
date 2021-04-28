<script>
    export let marketData

    // Components
    import PulseSpinner from '../pulse-spinner.svelte'
    import TokenLogo from '../../icons/token-logo.svelte'
    import TradeRocket from '../misc/trade-rocket.svelte'

    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    
	//Misc
    import { stringToFixed, numberWithCommas, setCurrencyType, setHomePageTableFilter } from '../../utils'
    import { tauUSDPrice, currencyType, homePageTableFilter } from '../../store'

    let selectElm
    let type = $currencyType

    $: currencyToDisplay = $currencyType
    $: volumeFilter = $homePageTableFilter ? $homePageTableFilter.volume : null;
    $: priceFilter = $homePageTableFilter ? $homePageTableFilter.price : null;
    $: currentFilter = $homePageTableFilter ? $homePageTableFilter.current : null;

    $: results = sortMarketData(marketData, $homePageTableFilter)

    const handleCurrencyTypeChange = () => setCurrencyType(type)

    const handleVolumeFilterClick = () => {
        homePageTableFilter.update(current => {
            if (current.current !== "volume") current.current = "volume"
            if (current.volume === "asc") current.volume = "dsc"
            else current.volume = "asc"
            
            setHomePageTableFilter(current.volume, current.prive, current.current)
            return current
        })
    }

    const handlePriceFilterClick = () => {
        homePageTableFilter.update(current => {
            if (current.current !== "price") current.current = "price"
            if (current.price === "asc") current.price = "dsc"
            else current.price = "asc"

            setHomePageTableFilter(current.volume, current.prive, current.current)
            return current
        })
    }

    const sortMarketData = () => {
        console.log("click")
        if (!marketData) return []
        if (!$homePageTableFilter) return marketData

        let r =  marketData.sort((a, b) => {
            if (currentFilter === "volume" && volumeFilter === "dsc") return a.Volume.isGreaterThan(b.Volume) ? 1 : -1
            if (currentFilter === "volume" && volumeFilter === "asc") return a.Volume.isGreaterThan(b.Volume) ? -1 : 1
            if (currentFilter === "price" && priceFilter === "dsc") return parseFloat(a.vol24Str) > parseFloat(b.vol24Str) ? 1 : -1
            if (currentFilter === "price" && priceFilter === "asc") return parseFloat(a.vol24Str) > parseFloat(b.vol24Str) ? -1 : 1
        })
        console.log(r)
        return r
    }

</script>

<style>
    .panel-container{
        max-width: 850px;
        padding: 18px 20px;
        
    }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-size-small);
    }
    .headings{
        border-bottom: 1px solid var(--text-primary-color-dimmer);
    }

    th{
        text-align: left;
        font-weight: 100;
        padding: 0 8px;
    }
    td{
        max-width: 100px;
        padding: 12px 8px 0;
    }
    div.ellipsis{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    a{
        text-decoration: underline;
    }
    a:hover{
        color: var(--color-primary);
    }
    select{
        width: unset;
        padding: 0px 5px 0px 7px;
        margin: 12px 0 0px;
    }
    .dropdown{
        margin: 0 0 7px;
    }
    button{
        align-items: baseline;
    }
    

	@media screen and (min-width: 550px) {
        td{
            max-width: 175px;
            padding: 12px 8px 0;
        }
	}

    @media screen and (min-width: 650px) {
        td{
            max-width: 250px;
            padding: 12px 8px 0;
        }
        table{
            font-size: var(--text-size-large);
        }
        .panel-container{
            padding: 18px 30px 30px;
        }
	}

    @media screen and (min-width: 2560px) {
        td{
            max-width: 300px;
            padding: 12px 8px 0;
        }
        table{
            font-size: var(--text-size-xlarge);
        }
        .panel-container{
            max-width: 1020px;
            padding: 48px 50px 50px;
        }
	}

</style>

<div class="panel-container">
    {#if results}
        <table>
            <tr class="headings">
                <th>#</th>
                <th>Name</th>
                <th>
                    <div class="dropdown">
                        <select bind:value={type} bind:this={selectElm} on:blur={handleCurrencyTypeChange}>
                                <option value={"tau"}>Price TAU</option>
                                <option value={"usd"}>Price USD</option>
                        </select>
                    </div>
                </th>
                <th>                    
                    <button class="flex-row" on:click={handlePriceFilterClick}>
                            24hr % 
                        <DirectionalChevron 
                            width="10px"
                            styles={`position: relative; ${priceFilter === "asc" ? "top: 6px;" : "top: -3px;"}`}
                            margin={"0 0 0 8px"}
                            direction={priceFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "price" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button></th>
                <th>
                    <button class="flex-row" on:click={handleVolumeFilterClick}>
                        Volume (24hrs) 
                        <DirectionalChevron 
                            width="10px" 
                            styles={`position: relative; ${volumeFilter === "asc" ? "top: 6px;" : "top: -3px;"}`}
                            margin={"0 0 0 8px"}
                            direction={volumeFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "volume" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
            </tr>

            {#each results as tokenInfo, index}
                <tr>
                    <td>{index + 1}</td>
                    <td class="flex-row flex-align-center">
                        <TokenLogo tokenMeta={tokenInfo.token} margin={"0 10px 0 0"}/>
                        
                        <div class="ellipsis">
                            <a href="{`/#/swap/${tokenInfo.contract_name}`}">{tokenInfo.token.token_name || "Unnamed Token"}</a>
                        </div>
                    </td>
                    <td>{currencyToDisplay === "usd" ? `$${stringToFixed(tokenInfo.usdPrice, 2)}` : stringToFixed(tokenInfo.Last, 5)}</td>
                    <td 
                        class:text-error={tokenInfo.change === "minus"}
                        class:text-success={tokenInfo.change === "plus"}>
                        {tokenInfo.vol24Str}%
                    </td>
                    <td>{numberWithCommas(currencyToDisplay === "usd" ? `$${stringToFixed(tokenInfo.usdVolume, 2)}` : stringToFixed(tokenInfo.Volume, 5))}</td>
                </tr>
            {/each}
        </table>
    {:else}
        <PulseSpinner margin="0 auto" color="var(--color-primary)" />
    {/if}
</div>
