<script>
    // Components
    import BoxedMessage from '../boxed-message.svelte'

    // Icons
    import RocketSwapCircleLogo from '../../icons/rocketswap-circle-logo.svelte'

    //Misc
    import { rswpBalance, rswpPrice } from '../../store'
    import { displayBalanceToPrecision } from '../../utils'
    import { config } from '../../config'

    const balanceMessage = {
        title: "The $RSWP token has the following benefits:",
        messages: [
            "Pay fees with an instant 30% discount.",
            "Stake to gain access to even lower discount on fees"
        ]
    }

    let logoSize = "80px";
</script>

<style>
    .container{
        flex-direction: column;
        margin-bottom: 2rem;
    }
    p{
        margin: 0
    }
    .balance{
        width: 100%;
    }
    .rswp-balance-info{
        line-height: 1.2;
    }

    @media screen and (min-width: 650px) {
        .container{
            flex-direction: row;
        }
    }
</style>

<div class="flex container flex-start-center">
    <div class="balance flex-row">
        <RocketSwapCircleLogo 
            styles={`width: ${logoSize}; height: ${logoSize}; min-width: ${logoSize}; min-height: ${logoSize};`} 
            margin="0 16px 0 0 "
        />
        <div class="flex-col rswp-balance-info text-large">
            <p class="text-color-primary weight-600">{`${displayBalanceToPrecision($rswpBalance, 8)} ${config.ammTokenSymbol}`}</p>
            <p class="text-primary-dimmer">{`(${displayBalanceToPrecision($rswpBalance.dividedBy($rswpPrice), 8)} ${config.currencySymbol})`}</p>
        </div>
    </div>
    <BoxedMessage title={balanceMessage.title} messages={balanceMessage.messages}/>
</div>

