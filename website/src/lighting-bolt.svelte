<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-secondary)"
    export let strokeColor = "var(--lamden-logo-color)"
</script>

<svg {width}  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" viewBox="0 0 190 317" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"
     style={`margin: ${margin}; shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;`}>
    <g>
        <polygon fill={color}  points="190,0 10,142 81,186 0,317 182,167 113,126 "
                stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="10" stroke={strokeColor}>
        </polygon>
    </g>
</svg>