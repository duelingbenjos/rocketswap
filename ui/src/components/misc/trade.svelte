<script>
    export let trade;

    //Icons
    import Rocket from '../../icons/rocket.svelte'

    //Misc
    import { stringToFixed } from '../../utils'
    import { config } from '../../config'

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
        height: 30px;
    }
    .trade > p {
        margin: 0;
        min-width: max-content;
    }
    .trade > .price {
        text-align: end;
        margin: 0 20px;
    }
    .trade > .timedelta{
        justify-self: flex-end;
        text-align: end;
        width: 110px;
        margin: 0 20px;
    }
    .trade > .icon{
        margin-right: 20px;
    }
</style>

<div class="trade flex-row">
    <div class="icon flex flex-center-center">
        <Rocket 
            width="20px" 
            color={trade.type === "buy" ? "var(--success-color)" : "var(--error-color)"} 
            direction={trade.type === "buy" ? "up-right" : "down-left"}
        />
    </div>
    <p >{`${stringToFixed(trade.amount, 4)} ${trade.type === "buy" ? trade.token_symbol : config.currencySymbol }`}</p>
    <p class="price flex-grow">{`${stringToFixed(trade.price, 4)} ${config.currencySymbol}`}</p>
    <p class="timedelta ">{timeDelta(trade.time)}</p>
</div>