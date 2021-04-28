<script>
    export let marketData

    // Components
    import PulseSpinner from '../pulse-spinner.svelte'
    import TokenLogo from '../../icons/token-logo.svelte'
    import TradeRocket from '../misc/trade-rocket.svelte'

    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    
	//Misc
    import { stringToFixed, numberWithCommas, setCurrencyType } from '../../utils'
    import { tauUSDPrice, currencyType } from '../../store'

    let selectElm
    let type = $currencyType

    $: currencyToDisplay = $currencyType

    const handleCurrencyTypeChange = () => setCurrencyType(type)

</script>

<style>
    .panel-container{
        max-width: 750px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
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
    }

	@media screen and (min-width: 430px) {
        td{
            max-width: 175px;
            padding: 12px 8px 0;
        }
	}

    @media screen and (min-width: 650px) {
        td{
            max-width: 300px;
            padding: 12px 8px 0;
        }
	}

</style>

<div class="panel-container">
    {#if marketData}
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
                <th>24hr %</th>
                <th>
                    Volume (24hrs) 
                    <button>
                        <DirectionalChevron width="10px" direction="down" color="var(--text-color-highlight)"/>
                    </button>
                </th>
            </tr>

            {#each marketData as tokenInfo, index}
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
                        {tokenInfo.vol24Str}
                    </td>
                    <td>{numberWithCommas(currencyToDisplay === "usd" ? `$${stringToFixed(tokenInfo.usdVolume, 2)}` : stringToFixed(tokenInfo.Volume, 5))}</td>
                </tr>
            {/each}
        </table>
    {:else}
        <PulseSpinner margin="0 auto" color="var(--color-primary)" />
    {/if}
</div>
