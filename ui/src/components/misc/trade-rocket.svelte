<script>
    import { onMount } from 'svelte'
	import { fly } from 'svelte/transition';
    import { linear } from 'svelte/easing';    

    // Icons
    import IconTradeRocket from '../../icons/rocket-trade.svelte'
    import TokenLogo from '../../icons/token-logo.svelte'

    export let tradeType;
    export let tokenMeta;

    let goNow = false;
    let rocket, innerRocket, innerHeight, innerWidth;
    
    onMount(() => {
        setTimeout(() => goNow = true, 0)
        setTimeout(() => {
        try {
            rocket.parentNode.removeChild(rocket)
        }catch(e){}
        }, 6000)
    })

    const getLeftValue = () => {
        let area = innerWidth - 200
        return  Math.floor(Math.random() * area) + 100
    }

    const getFlyDirection = () => {
        if (tradeType === "buy") return innerHeight  + 250
        return (innerHeight + 500) * -1
    }
</script>

<style>
    div{
        position: absolute;
    }

    div.buy{
        /*top: -250px;*/
        top: -250px;
    }

    div.sell{
        /*bottom: -150px;*/
        bottom: -200px;
        transform: translateY(-100px);
    }
    span{
        position: absolute;
        writing-mode: vertical-rl;
        text-orientation: upright;
        transform: translateX(-50%);
        top: 115px;
        left: 50%;
        letter-spacing: -7px;
        opacity: 0.6;
        font-weight: 800;
    }
    .direction.sell{
         transform: rotate(180deg) translateY(-100%);
    }
    .logo-top{
        position: absolute;
        transform: translateX(-50%);
        top: 83px;
        left: 50%;
    }
</style>

<svelte:window bind:innerHeight={innerHeight} bind:innerWidth={innerWidth}/>

{#if goNow}
    <div 
        bind:this={rocket}
        class:buy={tradeType === "buy"} 
        class:sell={tradeType === "sell"}
        in:fly="{{delay: 0, duration: 5000, x: 0, y: getFlyDirection(), opacity: 1, easing: linear}}" 
        style={`left: ${getLeftValue()}px;`}>
        <div class="direction" class:sell={tradeType === "sell"} bind:this={innerRocket}>
            <div class="logo-top">
                <TokenLogo {tokenMeta} width="30px" />
            </div>
            <IconTradeRocket 
                width="80px"
                color={tradeType === "buy" ? "var(--trade-rocket-green)" : "var(--trade-rocket-red)"}
            />
            <span class:sell={tradeType === "sell"}>
                {tokenMeta.token_symbol || "NONE"}
            </span>
        </div>
    </div>
{/if}
