<script>
    export let marketData

    // Components
    import PulseSpinner from '../pulse-spinner.svelte'
    import TokenLogo from '../../icons/token-logo.svelte'

	//Misc
    import { stringToFixed, numberWithCommas } from '../../utils'
    import { tauUSDPrice } from '../../store'

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
                <th>Price (USD)</th>
                <th>24hr %</th>
                <th>Volume (24hrs)</th>
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
                    <td>${stringToFixed(tokenInfo.usdPrice, 3)}</td>
                    <td 
                        class:text-error={tokenInfo.change === "minus"}
                        class:text-success={tokenInfo.change === "plus"}>
                        {tokenInfo.vol24Str}
                    </td>
                    <td>${numberWithCommas(stringToFixed(tokenInfo.usdVolume, 2))}</td>
                </tr>
            {/each}
        </table>
    {:else}
        <PulseSpinner />
    {/if}
</div>
