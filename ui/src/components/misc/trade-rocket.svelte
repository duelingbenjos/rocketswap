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
    
    let rocket, innerHeight, innerWidth;

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
        if (tradeType === "buy") return innerHeight + 200
        return (innerHeight + 200) * -1
    }
</script>

<style>
    div{
        position: absolute;
    }

    div.buy{
        top: -100px;
    }

    div.sell{
        bottom: -100px;
       
    }
    .direction.sell{
         transform: rotate(180deg);
    }
    .logo{
        position: absolute;
        transform: translateX(-50%);
        top: 16px;
        left: 50%;
    }
</style>

<svelte:window bind:innerHeight={innerHeight} bind:innerWidth={innerWidth}/>

{#if goNow}
    <div 
        bind:this={rocket}
        class="test" 
        class:buy={tradeType === "buy"} 
        class:sell={tradeType === "sell"}
        in:fly="{{delay: 0, duration: 3000, x: 0, y: getFlyDirection(), opacity: 1, easing: linear}}" 
        style={`left: ${getLeftValue()}px`}>
        <div class="direction" class:sell={tradeType === "sell"}>
            <div class="logo">
                <TokenLogo {tokenMeta} width="18px" />
            </div>
            <IconTradeRocket 
                width="80px"
                color={tradeType === "buy" ? "green" : "red"}
            />
        </div>
    </div>
{/if}
