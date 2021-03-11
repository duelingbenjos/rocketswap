<script>
    export let width = "24px";
    export let margin = "0";
    export let color;
    export let stroke;

</script>

<style>
    .path-fill{
        fill: var(--text-primary-color-dim);
    }
    .path-stroke{
        stroke: var(--text-primary-color-inverted);
    }
    svg:hover > path.fill{
        fill: var(--color-primary)!important;
    }
    svg:hover > path.stroke{
        stroke: black!important;
    }
</style>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path class="fill" class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}}:hover{fill: var(--color-primary);}`} d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" undefined="1"></path>
    <path class="fill" class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M7.10999 13.02L8.60999 17.2L12.31 15.95L10.05 13.96L7.10999 13.02Z" undefined="1"></path>
    <path class="fill" class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M4.62 12.22L10.05 13.96L14.65 18L16.62 6L4.62 12.22Z" undefined="1"></path>
    <path class="stroke" class:path-stroke={stroke ? false : true} style={`${stroke ? `stroke: ${stroke};` : ""}`} stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1"  d="M10.05 13.9599L12.27 11.1599"></path>
    <path class="stroke" class:path-stroke={stroke ? false : true} style={`${stroke ? `stroke: ${stroke};` : ""}`} stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1"  d="M7.10999 13.02L8.60999 17.2L12.31 15.95L10.05 13.96L7.10999 13.02Z"></path>
    <path class="stroke" class:path-stroke={stroke ? false : true} style={`${stroke ? `stroke: ${stroke};` : ""}`} stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1"  d="M4.62 12.22L10.05 13.96L14.65 18L16.62 6L4.62 12.22Z"></path>
</svg>
