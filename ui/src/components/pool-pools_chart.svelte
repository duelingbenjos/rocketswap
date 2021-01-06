<script>
    import { onMount, beforeUpdate } from 'svelte';

    //Services
    import { ApiService } from '../services/api.service'

    //Stores
    import { wallet_store } from '../store'

    //Icons
    import Base64SvgLogo from '../icons/base64_svg.svelte'

    //Misc
    import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'
    import { config } from '../config'

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
        border: 1px solid var(--box-border-color);
        border-radius: var(--border-radius);
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
        font-size: var(--text-size-small);
        text-align: left;
        vertical-align: top;
        padding: 0.7rem 6px 2px;
        
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    p{
        width: 100%;
        text-align: center;
        margin: 0 0;
    }
    p.reserves{
        text-align: right;
    }
    span.symbol{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    td.max-width{
        max-width: 100px;
    }
    td.center{
        text-align: center;
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
                <th>Token</th>
                <th>Contract</th>
                <th>Total Reserves</th>
                <th>LP</th>
                <th>%Pool</th>
                <th>Value</th>
                <th></th>
            </tr>
            {#each pairs as pair}
                <tr>
                    <td class="flex-row symbol max-width">
                            <Base64SvgLogo string={pair.logo_svg_base64} width={'27px'} height={'27px'} margin={"0 10px 0 0"}/>
                            <span class="symbol">{pair.token_symbol || "none"}</span>
                    </td>
                    <td class="max-width">{pair.contract_name}</td>
                    <td>
                            <p class="reserves">{`${stringToFixed(pair.reserves[1], 4)} ${pair.token_symbol}`}</p>
                            <p class="reserves">{`${stringToFixed(pair.reserves[0], 4)} ${config.currencySymbol}`}</p>
                    </td>
                    <td class="center" >{stringToFixed(balances[pair.contract_name], 4)}</td>
                    <td class="contract-name center">{`${stringToFixed( lp_percent(pair.contract_name, pair.lp) * 100, 1) }%` }</td>
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

