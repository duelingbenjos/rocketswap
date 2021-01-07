<script lang="ts">
    import { onMount, getContext } from 'svelte'

    //Services
    import { ApiService } from '../services/api.service'
    const apiService = ApiService.getInstance();
    
    //Stores
    import { walletIsReady, lwc_info } from '../store'

    //Misc
    import { config } from '../config'
    import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'

    //Props
    export let statList = []
    export let title
    export let pageState

    const { pageStats } = getContext('pageContext');

    let lp_balances = []
    let new_lp_share_percent;
    let currencyRatio;
    let tokenRatio;
    let lp_share_percent = "0%"

    $: selectedToken = pageState?.selectedToken;
    $: tokenSymbol = selectedToken ? selectedToken.token_symbol : undefined;
    $: tokenContract = selectedToken ? selectedToken.contract_name : undefined;
    $: calc = calcValues(pageState, $pageStats)
    $: currencyRatio = "—"
    $: tokenRatio = "—"
    $: wallet_store_changes = setLpBalances($walletIsReady, pageState)

    const calcValues = () => {
        if ($pageStats?.quoteCalc?.prices){
            const { currency, token } = $pageStats.quoteCalc?.prices;
            currencyRatio = currency.isNaN() ? "—" : stringToFixed(currency, 4);
            tokenRatio = token.isNaN() ? "—" : stringToFixed(token, 4);
        }

        if (pageState?.tokenLP && statList.includes("poolShare")){
            const { currencyAmount, tokenAmount, tokenLP } = pageState

            let quoteCalc = quoteCalculator(tokenLP)
            currencyRatio = stringToFixed(quoteCalc.prices.currency, 4)
            tokenRatio = stringToFixed(quoteCalc.prices.token, 4)

            let lp_balance = lp_balances[tokenContract] || toBigNumber("0")
            lp_share_percent = stringToFixed(quoteCalc.calcLpPercent(lp_balance).multipliedBy(100), 1)

            if (currencyAmount && tokenAmount) {
                new_lp_share_percent = stringToFixed(quoteCalc.calcNewShare(lp_balance, currencyAmount).multipliedBy(100), 1) + "%"
            }
        }
    }

    const setLpBalances = async () => {
        if ($walletIsReady){
            let vk = $lwc_info.walletAddress;
            if (vk){
                let balancesRes = await apiService.getUserLpBalance(vk)
                if (balancesRes) lp_balances = balancesRes.points
            }
        }
    }

</script>

<style>
    .container {
      width: 100%;
      margin-bottom: 1rem;
    }
    .header{
        justify-content: space-between;
        border: 1px solid var(--box-border-color);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        padding: 0 20px;
        font-weight: 400;
        color: var(--color-gray-5);
    }
    .stats{
        border: 1px solid var(--box-border-color);
        border-radius: 0 0 var(--border-radius) var(--border-radius);
        border-top: 0px;
        padding: 0.5rem 20px;

        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
    }
    .stat{
        min-width: max-content;
        text-align: center;
        color: var(--color-gray-5);
    }
    p{
        margin: 0;
        color: var(--text-primary-color-dim)
    }
    p > strong{
        margin:0;
        color: var(--text-primary-color);
        font-weight: 400;
    }
</style>

<div class="container ">
    <div class="header flex-row text-small">
        <p>{title}</p>
        <p>{statList.includes("poolShare") ? `Current: ${$pageStats?.currentLpSharePercent || "0"}%`: ""}</p>
    </div>
    <div class="stats text-small">
        {#if tokenSymbol}
            {#if statList.includes("ratios")}
                <div class="stat">
                    <p class="number"><strong >{tokenRatio}</strong></p>
                    <p>{`${config.currencySymbol} per ${tokenSymbol}`}</p>
                </div>

                <div class="stat">
                    <p class="number"><strong>{currencyRatio}</strong></p>
                    <p>{`${tokenSymbol} per ${config.currencySymbol}`}</p>
                </div>
            {/if}

            {#if statList.includes("poolShare")}
                <div class="stat">
                    <p class="number"><strong>{$pageStats?.newLpSharePercent || "—"}</strong></p>
                    <p>New share</p>
                </div>
            {/if}
        {/if}
    </div>
</div>



