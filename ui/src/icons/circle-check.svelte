<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-gray-5)"
    export let circleColor = "var(--success-color)" 
</script>


<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
    style={`margin: ${margin};`}>
    <path fill={circleColor} d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" undefined="1"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke={color} d="M7 12L10.5 15.5L17 8.5"></path>
</svg>
