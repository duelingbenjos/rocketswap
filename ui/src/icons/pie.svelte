<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-secondary)"
    export let pieColor = "var(--color-primary)"
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path fill={color} d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
    <path fill={pieColor} d="M12 22V12H22C22 17.52 17.52 22 12 22Z"></path>
</svg>
