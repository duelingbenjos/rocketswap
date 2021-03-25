<script>
    export let trade;

    //Icons
    import RocketswapLogo from '../../icons/rocketswap-logo.svelte'

    //Misc
    import { stringToFixed } from '../../utils'
    import { config } from '../../config'
    import { tauUSDPrice } from '../../store'

    const timeDelta = (timestamp) => {
        let seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
        let unit = "second";
        let direction = "ago";
        if (seconds < 0) {
            seconds = -seconds;
            direction = "from now";
        }
        let value = seconds;
        if (seconds >= 31536000) {
            value = Math.floor(seconds / 31536000);
            unit = "year";
        } else if (seconds >= 86400) {
            value = Math.floor(seconds / 86400);
            unit = "day";
        } else if (seconds >= 3600) {
            value = Math.floor(seconds / 3600);
            unit = "hour";
        } else if (seconds >= 60) {
            value = Math.floor(seconds / 60);
            unit = "minute";
        }
        if (value != 1)
            unit = unit + "s";
        return value + " " + unit + " " + direction;
    }

</script>

<style>
    .trade{
        height: 22px;
    }
    .trade > p {
        margin: 0;
        min-width: max-content;
    }
    .trade > .alignment{
        text-align: end;
        margin-right: 15px;
        width: 20%;
    }
    .trade > .icon{
        margin-left: 20px;
        margin-right: 20px;
    }
</style>

<div class="trade flex-row text-xsmall weight-400">
    <div class="icon flex flex-center-center">
        <RocketswapLogo 
            width="20px" 
            color={trade.type === "buy" ? "var(--price-color-buy)" : "var(--error-color)"} 
            reverse={trade.type === "sell" ? true : false}

        />
    </div>
    <p class="alignment">{`${stringToFixed(trade.amount, 4)} ${trade.token_symbol}`}</p>
    <p class="alignment">{`$${$tauUSDPrice ? stringToFixed($tauUSDPrice.multipliedBy(trade.price), 4) : "0.0" } USD`}</p>
    <p class="alignment flex-grow">{`${stringToFixed(trade.price, 4)} ${config.currencySymbol}`}</p>
    <p class="timedelta alignment">{timeDelta(trade.time)}</p>
</div>