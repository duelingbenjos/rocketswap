
<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let strokeColor = "var(--color-gray-5)"
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path stroke-linejoin="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M18 8H6C6 4.69 8.69 2 12 2C15.31 2 18 4.69 18 8Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-linejoin="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M19 22H5C4.45 22 4 21.55 4 21V9C4 8.45 4.45 8 5 8H19C19.55 8 20 8.45 20 9V21C20 21.55 19.55 22 19 22Z" clip-rule="evenodd" fill-rule="evenodd"></path>
    <path stroke-linejoin="round" stroke-linecap="square" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M9.17 12.17L14.83 17.83"></path>
    <path stroke-linejoin="round" stroke-linecap="square" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M12 11V19"></path>
    <path stroke-linejoin="round" stroke-linecap="square" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M14.83 12.17L9.17 17.83"></path>
    <path stroke-linejoin="round" stroke-linecap="square" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M16 15H8"></path>
</svg>
