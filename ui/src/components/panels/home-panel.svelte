<script>
    export let marketData

    // Components
    import PulseSpinner from '../pulse-spinner.svelte'
    import TokenLogo from '../../icons/token-logo.svelte'

    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    import VerifiedToken from '../../icons/verified_token.svelte'
    
	//Misc
    import { stringToFixed, numberWithCommas, setCurrencyType, setHomePageTableFilter, toBigNumber } from '../../utils'
    import { tauUSDPrice, currencyType, homePageTableFilter, verifiedTokens } from '../../store'

    let selectElm
    let type = $currencyType

    $: currencyToDisplay = $currencyType
    $: volumeFilter = $homePageTableFilter ? $homePageTableFilter.volume : null;
    $: priceFilter = $homePageTableFilter ? $homePageTableFilter.price : null;
    $: nameFilter = $homePageTableFilter ? $homePageTableFilter.name : null;
    $: liquidityFilter = $homePageTableFilter ? $homePageTableFilter.liquidity : null;
    $: priceChangeFilter = $homePageTableFilter ? $homePageTableFilter.price_change : null;
    $: currentFilter = $homePageTableFilter ? $homePageTableFilter.current : null;

    $: results = [...sortMarketData(marketData, $homePageTableFilter)]

    const handleCurrencyTypeChange = () => setCurrencyType(type)

    const handleFilterClick = (filer_name) => {
        homePageTableFilter.update(current => {
            if (current.current !== filer_name) current.current = filer_name
            if (current[filer_name] === "asc") current[filer_name] = "dsc"
            else current[filer_name] = "asc"

            setHomePageTableFilter(current.volume, current.price, current.price_change, current.name, current.liquidity, current.current)
            return current
        })
    }

    const sortMarketData = () => {
        if (!marketData) return []
        if (!$homePageTableFilter) return marketData

        let r =  marketData.sort((a, b) => {
            if (currentFilter === "price_change" && priceChangeFilter === "dsc") return a.PercentPriceIncrease_24h.isGreaterThan(b.PercentPriceIncrease_24h) ? 1 : -1
            if (currentFilter === "price_change" && priceChangeFilter === "asc") return a.PercentPriceIncrease_24h.isLessThan(b.PercentPriceIncrease_24h) ? 1 : -1
            if (currentFilter === "name" && nameFilter === "dsc") return a.token.token_name > b.token.token_name ? 1 : -1
            if (currentFilter === "name" && nameFilter === "asc") return a.token.token_name < b.token.token_name ? 1 : -1

            if (currencyToDisplay === "tau"){
                if (currentFilter === "volume" && volumeFilter === "dsc") return a.BaseVolume.isGreaterThan(b.BaseVolume) ? 1 : -1
                if (currentFilter === "volume" && volumeFilter === "asc") return a.BaseVolume.isLessThan(b.BaseVolume) ? 1 : -1
                if (currentFilter === "price" && priceFilter === "dsc") return a.Last.isGreaterThan(b.Last) ? 1 : -1
                if (currentFilter === "price" && priceFilter === "asc") return a.Last.isLessThan(b.Last) ? 1 : -1
                if (currentFilter === "liquidity" && liquidityFilter === "dsc") return a.tauLiquidity.isGreaterThan(b.tauLiquidity) ? 1 : -1
                if (currentFilter === "liquidity" && liquidityFilter === "asc") return a.tauLiquidity.isLessThan(b.tauLiquidity) ? 1 : -1
            }else{
                if (currentFilter === "volume" && volumeFilter === "dsc") return a.usdVolume.isGreaterThan(b.usdVolume) ? 1 : -1
                if (currentFilter === "volume" && volumeFilter === "asc") return a.usdVolume.isLessThan(b.usdVolume) ? 1 : -1
                if (currentFilter === "price" && priceFilter === "dsc") return a.usdPrice.isGreaterThan(b.usdPrice) ? 1 : -1
                if (currentFilter === "price" && priceFilter === "asc") return a.usdPrice.isLessThan(b.usdPrice) ? 1 : -1
                if (currentFilter === "liquidity" && liquidityFilter === "dsc") return a.usdLiquidity.isGreaterThan(b.usdLiquidity) ? 1 : -1
                if (currentFilter === "liquidity" && liquidityFilter === "asc") return a.usdLiquidity.isLessThan(b.usdLiquidity) ? 1 : -1
            }
        })
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
    tr:nth-child(2) > td{
        padding-top: 2rem;
    }
    .headings{
        border-bottom: 1px solid var(--text-primary-color-dimmer);
    }
    .mobile-hide{
        display: none;
    }
    tr{
        font-weight: 100;
    }
    th{
        text-align: left;
        padding: 0;
    }
    tr.headings > th{
        font-weight: 400;
    }
    td{
        max-width: 100px;
        padding: 1.5em 0px;
        vertical-align: top;
        line-height: 1.4;
    }
    div.ellipsis{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    select{
        width: unset;
        padding: 0px 5px 0px 7px;
        margin: 0;
        align-self: flex-start;
    }
    .dropdown{
        margin: 0 0 7px;
    }
    button{
        align-items: center;
        width: max-content;
    }
    .sub-heading{
        align-self: flex-start;
        margin-top: -5px;
    }
    .verified-token-legend{
        margin-bottom: 1rem;
        
    }
    .verified-token-legend > span{
        margin-left: 0.5em;
    }
    @media screen and (min-width: 430px) {
        .panel-container{
            background: var(--home-panel-background-gradient);
        }
        td{
            padding: 1.5em 8px 0;
        }

        th{
            padding: 0 8px;
        }
    }

    @media screen and (min-width: 610px) {
        .mobile-show{
            display: none;
        }
        .mobile-hide{
            display: table-cell;
        }
        
        select{
            align-self: unset;
        }
        th{
            padding: 0 8px;
        }
	}

	@media screen and (min-width: 680px) {
        td{
            max-width: 175px;
            padding: 1.5em 8px 0;
        }
	}

    @media screen and (min-width: 850px) {
        td{
            max-width: 250px;
            padding: 1.5em 0.5em 0;
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
            padding: 1.5em 8px 0;
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
    <div class="verified-token-legend flex row">
        <VerifiedToken />
        <span class="text-primary-dim">Rocketswap Verified Token</span>
    </div>
    {#if results.length > 0}

        <table>
            <tr class="headings">
                <th class="mobile-hide">#</th>
                <th>                    
                    <button class="flex-row" on:click={() => handleFilterClick('name')}>
                        Token Name
                        <DirectionalChevron 
                            width="10px"
                            styles={`position: relative; ${nameFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={nameFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "name" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
                <th>
                    <div class="flex-row">
                        <div class="dropdown">
                            <select bind:value={type} bind:this={selectElm} on:change={handleCurrencyTypeChange}>
                                    <option value={"tau"}>Price TAU</option>
                                    <option value={"usd"}>Price USD</option>
                            </select>
                        </div>
                        <button class="flex-row" on:click={() => handleFilterClick('price')}>
                            <DirectionalChevron 
                                width="10px"
                                styles={`position: relative; ${priceFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                                margin={"0 0 0 8px"}
                                direction={priceFilter === "asc" ? "down" : "up"} 
                                color={currentFilter === "price" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                            />
                        </button>
                    </div>
                    <button class="mobile-show flex-row text-primary-dim sub-heading" on:click={() => handleFilterClick('price_change')}>
                        <div>24hr %</div>
                        <DirectionalChevron 
                            width="10px"
                            styles={`position: relative; ${priceChangeFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={priceChangeFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "price_change" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
                <th class="mobile-hide">                    
                    <button class="flex-row" on:click={() => handleFilterClick('price_change')} >
                            24hr % 
                        <DirectionalChevron 
                            width="10px"
                            styles={`position: relative; ${priceChangeFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={priceChangeFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "price_change" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
                <th>
                    <button class="flex-row flex-align-center text-left" on:click={() => handleFilterClick('volume')}>
                        Volume (24hrs) 
                        <DirectionalChevron 
                            width="10px" 
                            styles={`position: relative; ${volumeFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={volumeFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "volume" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                    <button class="mobile-show flex-row text-primary-dim sub-heading" on:click={() => handleFilterClick('liquidity')}>
                        Liquidity
                        <DirectionalChevron 
                            width="10px" 
                            styles={`position: relative; ${liquidityFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={liquidityFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "liquidity" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
                <th class="mobile-hide">
                    <button class="flex-row" on:click={() => handleFilterClick('liquidity')}>
                        Liquidity
                        <DirectionalChevron 
                            width="10px" 
                            styles={`position: relative; ${liquidityFilter === "asc" ? "top: 4px;" : "top: -6px;"}`}
                            margin={"0 0 0 8px"}
                            direction={liquidityFilter === "asc" ? "down" : "up"} 
                            color={currentFilter === "liquidity" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                        />
                    </button>
                </th>
            </tr>

            {#each results as tokenInfo, index}
                <tr>
                    <td class="mobile-hide">
                        <div class="flex flex-align-center">
                            {index + 1}
                        </div>
                    </td>
                    <td class="flex-col">
                        <div class="flex-row flex-align-center" >
                            <TokenLogo tokenMeta={tokenInfo.token} margin={"0 10px 0 0"} width="45px"/>
                            <div class="flex-col overflow hidden">
                                <div class="ellipsis">
                                    <a href="{`/#/swap/${tokenInfo.contract_name}`}">{tokenInfo.token.token_name || "Unnamed Token"}</a>
                                </div>
    
                                <div class="flex-row flex-align-center">
                                    <div class="text-primary-dimmer symbol-text">{tokenInfo.token.token_symbol}</div>
                                    {#if $verifiedTokens.includes(tokenInfo.contract_name)}
                                        <VerifiedToken margin="0 0 0 0.5em"/>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        
                    </td>
                    
                    <td >
                        {currencyToDisplay === "usd" ? `$${tokenInfo.usdPrice.toFixed(9).match(/^-?\d*\.?0*\d{0,2}/)[0]}` : stringToFixed(tokenInfo.Last, 9)}
                        <div
                            class:text-error={tokenInfo.PercentPriceIncrease_24h.isLessThan(0)}
                            class:text-success={tokenInfo.PercentPriceIncrease_24h.isGreaterThan(0)}
                            class="mobile-show">
                            {stringToFixed(tokenInfo.PercentPriceIncrease_24h, 2)}%
                        </div>
                    </td>
                    <td
                        class:text-error={tokenInfo.PercentPriceIncrease_24h.isLessThan(0)}
                        class:text-success={tokenInfo.PercentPriceIncrease_24h.isGreaterThan(0)}
                        class="mobile-hide">
                        {`${tokenInfo.PercentPriceIncrease_24h.isGreaterThan(0) ? "+" : ""}${stringToFixed(tokenInfo.PercentPriceIncrease_24h, 2)}%`}
                    </td>
                    <td class="mobile-hide">
                        {numberWithCommas(currencyToDisplay === "usd" ? `$${tokenInfo.usdVolume.toFixed(2).toString()}` : stringToFixed(tokenInfo.BaseVolume, 5))}
                    </td>
                    <td class="mobile-show">
                        {numberWithCommas(currencyToDisplay === "usd" ? `$${tokenInfo.usdVolume.toFixed(2).toString()}` : stringToFixed(tokenInfo.BaseVolume, 5))}
                        <div class="text-primary-dim">
                            {numberWithCommas(currencyToDisplay === "usd" ? `$${tokenInfo.usdLiquidity.toFixed(2).toString()}` : stringToFixed(tokenInfo.tauLiquidity, 5))}
                        </div>
                        
                    </td>
                    <td class="mobile-hide">
                        {numberWithCommas(currencyToDisplay === "usd" ? `$${tokenInfo.usdLiquidity.toFixed(2).toString()}` : stringToFixed(tokenInfo.tauLiquidity, 5))}
                    </td>
                </tr>
            {/each}
        </table>

    {:else}
        <PulseSpinner margin="0 auto" color="var(--color-primary)" />
    {/if}
</div>
