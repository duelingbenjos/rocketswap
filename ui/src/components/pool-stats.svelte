<script lang="ts">
    import { onMount } from 'svelte'
    import { ApiService } from '../services/api.service'
    import { pool_panel_store } from '../store'
    import { config } from '../config'

    export let statList = []
    export let title

    const apiService = ApiService.getInstance();

    let balances = []

    $: selected_token = $pool_panel_store?.slot_b?.selected_token || undefined;
    $: token_symbol = selected_token ? selected_token.token_symbol : undefined;
    $: token_contract = selected_token ? selected_token.contract_name : undefined;
    $: lp_balance = balances[token_contract] || "0"
    $: lp_share = selected_token?.info ? lp_balance / selected_token.info.lp : undefined
    $: lp_share_percent = lp_share ? parseFloat(lp_share * 100).toFixed(1) : "0";
    $: currencyValue = $pool_panel_store?.slot_a?.input_amount || "";
    $: tokenValue = $pool_panel_store?.slot_b?.input_amount || "";
    $: bothValues = currencyValue !== "" && tokenValue !== ""

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
        {#if token_symbol && bothValues}
            {#if statList.includes("ratios")}
                <div class="stat">
                    <p><strong>{`${currencyValue / tokenValue}`}</strong></p>
                    <p>{`${config.currencySymbol} per ${token_symbol}`}</p>
                </div>

                <div class="stat">
                    <p><strong>{`${tokenValue / currencyValue }`}</strong></p>
                    <p>{`${token_symbol} per ${config.currencySymbol}`}</p>
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
