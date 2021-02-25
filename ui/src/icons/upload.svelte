<script>
    export let width = "24px";
    export let minWidth = null;
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let strokeColor = "var(--color-gray-5)"
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin}; ${minWidth ? `min-width: ${minWidth}` : ""}`}>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M20 13C19.17 12.37 18.13 12 17 12C14.24 12 12 14.24 12 17C12 18.13 12.37 19.17 13 20H3C2.45 20 2 19.55 2 19V3C2 2.45 2.45 2 3 2H15.59C15.85 2 16.11 2.11 16.29 2.29L19.71 5.71C19.89 5.89 20 6.15 20 6.41V13Z"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M12.1 16H6"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M6 11H16"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M6 6H11"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M17 22C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12C14.2386 12 12 14.2386 12 17C12 19.7614 14.2386 22 17 22Z"></path>
    <path stroke-linejoin="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M17 14V20"></path>
    <path stroke-linejoin="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} d="M20 17H14"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M15 2V7H20V6.41C20 6.15 19.89 5.89 19.71 5.71L16.29 2.29C16.11 2.11 15.85 2 15.59 2H15Z"></path>
</svg>
