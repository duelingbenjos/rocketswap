<script>
    import { walletIsReady, lwc_info } from '../store'
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let strokeColor = "var(--color-gray-5)"
</script>

<style>
    svg:hover > path{
        fill: var(--color-secondary);
    }
</style>


<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path stroke-linecap="round" stroke-width="1" stroke={strokeColor} d="M11.004 18.0358C11.004 18.0358 9 17.3519 9 16C9 14.6481 9.85898 14.2413 9.85898 14.2413"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke={strokeColor} fill={color} d="M19 22C19 20.6745 16.9561 18 12 18C7.04395 18 5 20.6745 5 22H19Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-width="1" stroke={strokeColor} fill={color} d="M9.46819 14.0328C12.8174 15.9342 17.5197 14.7898 18.6532 12.6956C19.7866 10.6013 18.0674 7.20475 14.5822 5.31173C11.233 3.41036 7.62488 3.60682 6.49142 5.70107C5.35795 7.79531 6.11898 12.1314 9.46819 14.0328Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-width="1" stroke={strokeColor} fill={color} d="M10.48 12.4142C13.1515 13.9308 17.4764 14.8942 18.7013 12.6429C19.6735 10.5318 18.1877 7.41994 14.7209 5.39102C11.2541 3.3621 7.42523 3.66865 6.48915 5.68889C5.55307 7.70912 7.1308 10.5128 10.48 12.4142Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-width="1" stroke={strokeColor} fill={color} d="M18 4C18.5523 4 19 3.55228 19 3C19 2.44772 18.5523 2 18 2C17.4477 2 17 2.44772 17 3C17 3.55228 17.4477 4 18 4Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-linecap="round" stroke-width="1" stroke={strokeColor} d="M17.4 3.8L13 9"></path>
    {#if $walletIsReady}
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke={strokeColor} d="M2 2L22 22"></path>
    {/if}
</svg>
