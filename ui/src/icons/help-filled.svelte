<script>    
    export let width = "18px";
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let tooltip;
</script>

<style>
    .tooltip{
        display: none;
        transform: translateX(-32%);
        background: var(--color-gray-1);
        border-radius: 10px;
        width: 268px;
        color: var(--color-gray-5);
        font-size: var(--text-size-small);
        padding: 9px;
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
        border-color: transparent transparent var(--color-gray-1) transparent;
        left: 34%;
        top: -16px;

        animation: fadeInPoint 0.4s;
        -webkit-animation: fadeInPoint 0.4s;
        -moz-animation: fadeInPoint 0.4s;
        -o-animation: fadeInPoint 0.4s;
        -ms-animation: fadeInPoint 0.4s;
    }
    .icon-container:hover > .tooltip {
        display: block;
        position: absolute;
    }
    p{
        margin: 0 0 0.25rem;
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

<div class="icon-container">
    <svg {width} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={`margin: ${margin};`}>
        <path d="M11 19.25C15.5563 19.25 19.25 15.5563 19.25 11C19.25 6.44365 15.5563 2.75 11 2.75C6.44365 2.75 2.75 6.44365 2.75 11C2.75 15.5563 6.44365 19.25 11 19.25Z" fill={color}/>
        <path d="M11 15.5834V15.5925" stroke="#2B284B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.0001 12.375C10.9832 12.0774 11.0635 11.7824 11.2288 11.5344C11.3941 11.2864 11.6356 11.0989 11.9168 11C12.2613 10.8682 12.5706 10.6583 12.8202 10.3867C13.0698 10.1151 13.253 9.78928 13.3553 9.43487C13.4576 9.08045 13.4762 8.70713 13.4098 8.34429C13.3433 7.98144 13.1935 7.63899 12.9721 7.34388C12.7508 7.04877 12.464 6.80907 12.1343 6.64364C11.8046 6.47822 11.4409 6.39158 11.0721 6.39056C10.7032 6.38953 10.3391 6.47415 10.0085 6.63775C9.67785 6.80134 9.38971 7.03945 9.16675 7.33333" stroke="#2B284B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div class="tooltip">
        {#each tooltip as tip}
            <p>{tip}</p>
        {/each}
    </div>
</div>

