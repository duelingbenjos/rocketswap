<script>    
    export let width = "18px";
    export let margin = "0";
    export let color = "var(--color-primary)";
    export let tooltip;
    export let icon;
    export let direction = "right";

</script>

<style>
    .tooltip{
        display: none;
        transform: translateX(-32%);
        background: var(--color-gray-1);
        border-radius: 10px;
        width: max-content;
        font-size: var(--text-size-small);
        padding: 0.5rem 1rem;
        z-index: 1;

        animation: fadeIn 0.5s;
        -webkit-animation: fadeIn 0.5s;
        -moz-animation: fadeIn 0.5s;
        -o-animation: fadeIn 0.5s;
        -ms-animation: fadeIn 0.5s;
    }
    .tooltip:before{
        content: '';
        display: block;
        width: 0;
        height: 0;
        position: absolute;
        border-width: 8px;
        border-style: solid;
        border-color: transparent var(--color-gray-1) transparent transparent;
        left: -16px;
        top: 50%;
        transform: translatey(-50%);

        animation: fadeInPoint 0.4s;
        -webkit-animation: fadeInPoint 0.4s;
        -moz-animation: fadeInPoint 0.4s;
        -o-animation: fadeInPoint 0.4s;
        -ms-animation: fadeInPoint 0.4s;
    }
    .icon-container:hover > .tooltip {
        display: block;
        position: absolute;
        top: 50%;
        transform: translate(105%,-50%);
        right: 0;
    }
    p{
        margin: 0 0 0.25rem;
        font-weight: 600;
    }
    @keyframes fadeIn {
        0% {opacity:0;}
        100% {opacity:1;}
    }
    @keyframes fadeInPoint {
        0% {opacity:0.55;}
        100% {opacity:1;}
    }

</style>

<div class="icon-container" style="{`height: ${width}`}">
    <svelte:component this={icon} {margin} width="100%"/>
    <div class="tooltip" class:bottom={direction === "bottom"} class:right={direction === "right"} >
        {#each tooltip as tip}
            <p class="text-warning-dark">{tip}</p>
        {/each}
    </div>
</div>