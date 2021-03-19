<script>
    export let width = "24px";
    export let margin = "0";
    export let mainColor = "primary"

    $: color = `var(--color-${mainColor})`
    $: backColor = `var(--color-${mainColor}-dark)`
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path fill={backColor} d="M21 3H13V11H21V3Z" undefined="0" transform="translate(2,2)"></path>
    <path fill={color} d="M21 3H13V11H21V3Z" undefined="1"></path>
    <path fill={backColor} d="M21 13H13V21H21V13Z" undefined="0" transform="translate(2,2)"></path>
    <path fill={color} d="M21 13H13V21H21V13Z" undefined="1"></path>
    <path fill={backColor} d="M11 13H3V21H11V13Z" undefined="0" transform="translate(2,2)"></path>
    <path fill={color} d="M11 13H3V21H11V13Z" undefined="1"></path>
    <path fill={backColor} d="M11 3H3V11H11V3Z" undefined="0" transform="translate(2,2)"></path>
    <path fill={color} d="M11 3H3V11H11V3Z" undefined="1"></path>
</svg>
