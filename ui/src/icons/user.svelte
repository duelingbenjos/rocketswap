<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let strokeColor = "var(--color-gray-5)"
</script>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin}; min-width: 75px;`}>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
    <path stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M19.33 18.79C18.09 15.97 15.28 14 12 14C8.72 14 5.91 15.97 4.67 18.79C6.5 20.76 9.1 22 12 22C14.9 22 17.5 20.76 19.33 18.79Z"></path>
    <path stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5" stroke={strokeColor} fill={color} d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z"></path>
</svg>
