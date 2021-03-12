<script>
    // Components
    import RSWPPayFeesChkBox from './rswp-pay-fees-chkbox.svelte'
    
    // Icons
    import RocketSwapCircleLogo from '../../icons/rocketswap-circle-logo.svelte'

    //Misc
    import { rswpBalance, rswpPrice } from '../../store'
    import { displayBalanceToPrecision } from '../../utils'
    import { config } from '../../config'

    let logoSize = "80px";
</script>

<style>
    .container{
        box-sizing: border-box;
        background: url("/assets/images/stars-bg.jpg");
        background-size: contain;
        color: var(--text-primary-color);
        font-size: var(--text-size-small);
        border-radius: 0;
        border-top: 2px solid var(--color-primary);
        padding: 10px 20px;
        box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        padding-top: 15px;
        width: 100%;
    }
    p{
        margin: 0
    }
    .rswp-balance-info{
        line-height: 1.3;
    }
    @media screen and (min-width: 430px) {
        .container{
            padding: 30px;
            border-radius: var(--border-radius);
        }
    }
</style>
<div>

</div>
<div class="flex-row container">
    <div class="flex-row">
        <RocketSwapCircleLogo 
            styles={`width: ${logoSize}; height: ${logoSize}; min-width: ${logoSize}; min-height: ${logoSize};`} 
            margin="0 16px 0 0 "
        />
        <div class="flex-col rswp-balance-info text-large">
            <p class="text-color-primary weight-600">{`${displayBalanceToPrecision($rswpBalance, 8)} ${config.ammTokenSymbol}`}</p>
            <p class="text-primary-dimmer">{`(${displayBalanceToPrecision($rswpBalance.dividedBy($rswpPrice), 8)} ${config.currencySymbol})`}</p>
        </div>
    </div>
    <div class="flex flex-end-end flex-grow">
        <RSWPPayFeesChkBox />
    </div>
</div>