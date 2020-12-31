<script lang="ts">
    import { onMount } from 'svelte'
    import { ApiService } from '../services/api.service'
    import { pool_panel_store, wallet_store } from '../store'
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
    $: lp_balances = $wallet_store?.wallet_state?.lp_balances || {};
    $: lp_balance = lp_balances[tokenContract] || "0";
    $: lp_share = pageState.tokenLp ? lp_balance / pageState.tokenLp : 0;
    $: lp_share_percent = lp_share ? parseFloat(lp_share * 100).toFixed(1) : "0";
    $: currencyValue = pageState?.currencyAmount || "";
    $: tokenValue = pageState?.tokenAmount || "";
    $: currencyRatio = currencyValue / tokenValue;
    $: tokenRatio = tokenValue / currencyValue;

    //$: wallet_store_changes = setLpBalances($wallet_store)

    onMount(async () => {
        console.log($wallet_store)
        // TODO REMOVE HARDCODED VK
        //let balancesRes = await apiService.getUserLpBalance($wallet_store.wallet_state.wallets[0])
        //if (balancesRes) balances = balancesRes.points
    })

    const setLpBalances = () => {
        //if ($wallet_store.wallet_state.lp_balance) lp_balance
    }

</script>

<style>
    .container {
      width: 100%;
      margin-bottom: 1rem;
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
        {#if tokenSymbol}
            {#if statList.includes("ratios")}
                <div class="stat">
                    <p><strong>{isFinite(currencyRatio) ? `${stringToFixed(currencyValue / tokenValue, 4)}` : '-'}</strong></p>
                    <p>{`${config.currencySymbol} per ${tokenSymbol}`}</p>
                </div>

                <div class="stat">
                    <p><strong>{isFinite(tokenRatio) ? `${stringToFixed(tokenValue / currencyValue, 4)}` : '-'}</strong></p>
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
