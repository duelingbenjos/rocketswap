<script>
    import { onMount, beforeUpdate } from 'svelte';

    import { ApiService } from '../services/api.service'

    import { wallet_store } from '../store'

    import { stringToFixed } from '../utils'

    const apiService = ApiService.getInstance();
    
    let initialized = false;
    let vk;
    let balances = [];
    let pairs = [];

    beforeUpdate(() => {
        console.log(pairs)
        if ($wallet_store.wallets) checkVk()
    })

    const checkVk = () => {
        if ($wallet_store.wallets.length > 0) {
            if (vk !== $wallet_store.wallets[0]) {
                vk = $wallet_store.wallets[0]
                initialized = false;
            }
            if (!initialized) {
                getLpBalances();
                initialized = true;
            }

        }
    }

    const getLpBalances = async () => {
        //let balancesRes = await apiService.getUserLpBalance(vk)

        // HARDCODED VK FOR TESTING
            let balancesRes = await apiService.getUserLpBalance('f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def')
        //

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
        font-size: 0.8em;
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
                    <td>???</td>
                    <td>{pair.token_symbol}</td>
                    <td>{pair.contract_name}</td>
                    <td>{`${stringToFixed(pair.reserves[1], 4)} / ${stringToFixed(pair.reserves[0], 4)}`}</td>
                    <td>{balances[pair.contract_name]}</td>
                    <td>{`${lp_percent(pair.contract_name, pair.lp) * 100}%` }</td>
                    <td>{calc_value(pair.contract_name, pair.lp, pair.reserves[1], pair.reserves[0], pair.price)} TAU</td>
                    <td><a href="{`/#/pool-add/${pair.contract_name}`}">Adjust ></a></td>
                </tr>
            {/each}
        </table>
    {:else}
        <p>No liquidity found.</p>
    {/if}
</div>

