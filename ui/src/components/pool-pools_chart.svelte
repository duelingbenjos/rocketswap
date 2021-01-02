<script>
    import { onMount, beforeUpdate } from 'svelte';

    import { ApiService } from '../services/api.service'

    import { wallet_store } from '../store'

    import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'

    const apiService = ApiService.getInstance();
    
    let initialized = false;
    let vk;
    let balances = [];
    let pairs = [];

    $: vk = getVK($wallet_store)

    beforeUpdate(() => {
        if ($wallet_store.wallets) checkVk()
    })

    const getVK = () => {
        if ($wallet_store?.wallets?.length > 0) {
            if (vk !== $wallet_store.wallets[0]) {
                vk = $wallet_store.wallets[0]
                getLpBalances();
            }
        }
    }

    const checkVk = () => {

    }

    const getLpBalances = async () => {
        let balancesRes = await apiService.getUserLpBalance(vk)

        // HARDCODED VK FOR TESTING
        // let balancesRes = await apiService.getUserLpBalance('f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def')

        if (balancesRes) {
            balances = balancesRes.points
            getPairs()
        }
    }

    const getPairs = async () => {
        const contracts = Object.keys(balances).join(',')
        let pairsRes = await apiService.getPairs(contracts)
        if (pairsRes) pairs = Object.keys(pairsRes).map(key => pairsRes[key])
    }

    const lp_percent = (contract_name, lp_total) => (balances[contract_name] / lp_total)

    const calc_value = (contract_name, lp_total, token_amount, currency_amount, price) => {
        const share = lp_percent(contract_name, lp_total)
        let value =  (currency_amount * share) + (token_amount * share * price )
        return value.toPrecision(4)
    }
</script>

<style>
    div{
        box-sizing: border-box;
        border: 1px solid #fff;
        border-radius: 32px;
        padding: 15px 0 20px;
    }
    table{
        border-collapse: collapse;
    }
    tr:first-child{
        border-bottom: 1pt solid #fff;
    }
    th{
        padding: 0 6px 15px;   
    }
    th:first-child, td:first-child{
        padding-left: 30px;
    }

    th:last-child, td:last-child{
        padding-right: 15px;
        width:100%;
    }
    th:not(:last-child), td:not(:last-child) {
      white-space: nowrap;
    }
    td{
        font-size: var(--text-size-xsmall);
        text-align: left;
        padding: 10px 6px 2px;
    }

    p{
        width: 100%;
        text-align: center;
        margin: 0 0;
    }

    @media screen and (max-width: 800px) {
        div {
            border-radius: 0px;
        }
        th:last-child, td:last-child{
            white-space: nowrap;
        }
    }
</style>
<div>
    {#if pairs.length > 0}
        <table>
            <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Contract</th>
                <th>Amount Token/TAU</th>
                <th>LP</th>
                <th>%Pool</th>
                <th>Value</th>
                <th></th>
            </tr>
            {#each pairs as pair}
                <tr>
                    <td>{pair.token_name || "none"}</td>
                    <td>{pair.token_symbol || "none"}</td>
                    <td>{pair.contract_name}</td>
                    <td>{`${stringToFixed(pair.reserves[1], 4)} / ${stringToFixed(pair.reserves[0], 4)}`}</td>
                    <td>{stringToFixed(balances[pair.contract_name], 4)}</td>
                    <td>{`${stringToFixed( lp_percent(pair.contract_name, pair.lp) * 100, 4) }%` }</td>
                    <td>
                        {stringToFixed(quoteCalculator(pair).calcTokenValueInCurrency(toBigNumber(balances[pair.contract_name])), 4)}
                         TAU
                    </td>
                    <td><a href="{`/#/pool-add/${pair.contract_name}`}" class="text-link">Adjust ></a></td>
                </tr>
            {/each}
        </table>
    {:else}
        <p>No liquidity found.</p>
    {/if}
</div>

