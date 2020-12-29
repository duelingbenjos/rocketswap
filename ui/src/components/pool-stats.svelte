<script lang="ts">
    import { onMount } from 'svelte'
    import { ApiService } from '../services/api.service'
    import { pool_panel_store } from '../store'
    import { config } from '../config'
    import { stringToFixed } from '../utils'

    export let statList = []
    export let title
    export let pageState

    const apiService = ApiService.getInstance();

    let balances = []

    $: selectedToken = pageState?.selectedToken;
    $: tokenSymbol = selectedToken ? selectedToken.token_symbol : undefined;
    $: tokenContract = selectedToken ? selectedToken.contract_name : undefined;
    $: lp_balance = balances[tokenContract] || "0";
    $: lp_share = selectedToken?.info ? lp_balance / selectedToken.info.lp : undefined;
    $: lp_share_percent = lp_share ? parseFloat(lp_share * 100).toFixed(1) : "0";
    $: currencyValue = pageState?.currencyAmount || "";
    $: tokenValue = pageState?.tokenAmount || "";
    $: bothValues = currencyValue !== "" && tokenValue !== "";

    onMount(async () => {
        // TODO REMOVE HARDCODED VK
        let balancesRes = await apiService.getUserLpBalance('f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def')
        if (balancesRes) balances = balancesRes.points
    })
</script>

<style>
    .container {
      width: 100%;
      
    }
    .header{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        padding: 0 20px;
        font-size: 0.8em;
    }
    .stats{
        border: 1px solid var(--border-color);
        border-radius: 0 0 var(--border-radius) var(--border-radius);
        border-top: 0px;
        padding: 20px;
        font-size: 0.9em;

        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }
    .stat{
        width: 45%;
        text-align: center;
    }
    p{
        margin: 0.4rem 0;
    }
    p > strong{
        margin:0;
    }
</style>

<div class="container">
    <div class="header">
        <p>{title}</p>
        <p>{statList.includes("poolShare") ? `Current: ${lp_share_percent}%`: ""}</p>
    </div>
    <div class="stats">
        {#if tokenSymbol && bothValues}
            {#if statList.includes("ratios")}
                <div class="stat">
                    <p><strong>{`${stringToFixed(currencyValue / tokenValue, 4)}`}</strong></p>
                    <p>{`${config.currencySymbol} per ${tokenSymbol}`}</p>
                </div>

                <div class="stat">
                    <p><strong>{`${stringToFixed(tokenValue / currencyValue, 4) }`}</strong></p>
                    <p>{`${tokenSymbol} per ${config.currencySymbol}`}</p>
                </div>
            {/if}

            {#if statList.includes("poolShare")}
                <div class="stat">
                    <p><strong>{`${lp_share_percent}%`}</strong></p>
                    <p>Share of Pool</p>
                </div>
            {/if}
        {/if}
    </div>
</div>
