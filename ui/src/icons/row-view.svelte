<script>
    export let width = "24px";
    export let margin = "0";
    export let mainColor = "primary"

    $: color = `var(--color-${mainColor})`
    $: backColor = `var(--color-${mainColor}-dark)`
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
<path fill={backColor} d="M22 4H2V12H22V4Z" undefined="0" transform="translate(2,2)"></path>
<path fill={color} d="M22 4H2V12H22V4Z" undefined="1"></path>
<path fill={backColor} d="M22 12H2V20H22V12Z" undefined="0" transform="translate(2,2)"></path>
<path fill={color} d="M22 12H2V20H22V12Z" undefined="1"></path>
<path stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M22 12H2"></path>
</svg>
