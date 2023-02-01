<script>
    import { getContext } from 'svelte'

    // Components
    import TokenLogo from '../../icons/token-logo.svelte'

    // Icons
    import PieIcon from '../../icons/pie.svelte'
    import IconVerifiedToken from '../../icons/verified_token.svelte'

    // Misc
    import { toBigNumber, quoteCalculator, stringToFixed } from '../../utils'
    import { lpBalances, verifiedTokens } from '../../store'
    import { config } from '../../config'

    const {  adjustLiquidityRedirect, removeLiquidityRedirect } = getContext("pageContext")

    export let pairInfo;

    $: quoteCalc = quoteCalculator(pairInfo)
    $: lpTokens = $lpBalances[pairInfo.contract_name] || toBigNumber("0")
    $: lpTokenValue = quoteCalc.calcTokenValueInCurrency(lpTokens)
    $: poolPercent = quoteCalc.calcLpPercent(lpTokens)
    $: isVerified = $verifiedTokens.includes(pairInfo.contract_name)


    const lp_percent = (contract_name, lp_total) => (balances[contract_name] / lp_total)

    const calc_value = (contract_name, lp_total, token_amount, currency_amount, price) => {
        const share = lp_percent(contract_name, lp_total)
        let value =  (currency_amount * share) + (token_amount * share * price )
        return value.toPrecision(4)
    }

</script>

<style>
    .panel-container{
        max-width: 300px;
        min-width: 280px;
        padding: 20px;
        margin: 10px 0;

        border-radius: 32px;
        background: var(--panel-background-gradient);

        box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
    }
    .header{
        margin-bottom: 1rem;
    }
    .identity{
        line-height: 1.15;
    }
    .info{
        margin: 1rem 0;
        
    }
    a{
        text-decoration: underline;
    }
    a:hover{
        color: var(--color-primary);
    }
    .percent{
        position: relative;
        top: -2px;
        margin-left: 4px;
        text-shadow: 1px 1px var(--pool-pannel-header-percent-text-shadow);
    }
    button{
        margin: 10px 8px 0;
    }
    div > strong {
        width: 100%;
        text-align: right;
    }
    hr{
        opacity: 0.5;
    }
    @media screen and (min-width: 430px) {
        .panel-container{
            margin: 10px;
        }
    }

</style>


<div class="panel-container">
    <div class="flex-row header">
        <TokenLogo tokenMeta={pairInfo} width={'45px'} margin={"0 12px 0 0"}/>
        <div class="flex-col text-large identity">
            <a href="{`/#/swap/${pairInfo.contract_name}`}">{pairInfo.token_symbol || "none"}</a>
            <span class="text-primary-dimmer">{pairInfo.token_name || "none"}</span>
        </div> 
        <div class="flex-col flex-grow">
            <div class="flex-row flex-start-end">
                <PieIcon width="20px"/>
                <span class="percent text-color-primary">{stringToFixed(poolPercent.multipliedBy(100), 2)}%</span>
            </div>
            {#if isVerified}
                <IconVerifiedToken width="26px" margin="-5px 0 0 auto"/>
            {/if}
        </div>

    </div>
    
    <div class="info">
        <div class="flex-row">
            <span class="text-color-secondary weight-600">{pairInfo.token_symbol}</span>
            <strong class="flex-grow">{`${stringToFixed(pairInfo.reserves[1].multipliedBy(poolPercent), 8)} `}</strong>
        </div>
        <div class="flex-row">
            <span class="text-primary-dim weight-600">{config.currencySymbol}</span>
            <strong class="flex-grow">{`${stringToFixed(pairInfo.reserves[0].multipliedBy(poolPercent), 8)} `}</strong>
        </div>
        <div class="flex-row flex-justify-end">
            <span class="text-primary-dim">{`${stringToFixed(lpTokens, 8)} LP`}</span>
        </div>
    </div>
    <hr>
    <div class="flex-row flex-center-center buttons">
        <button class="primary" on:click={() => adjustLiquidityRedirect(pairInfo.contract_name)}>ADJUST</button>
        <button class="primary outline" on:click={() => removeLiquidityRedirect(pairInfo.contract_name)}>REMOVE</button>
    </div>
</div>
