<script>
    export let width = "24px";
    export let margin = "0";
    export let color;

</script>

<style>
    .path-fill{
        fill: var(--text-primary-color-dim);
    }
    svg:hover > path{
        fill: var(--color-primary)!important;
    }
</style>

<svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot=""
     style={`margin: ${margin};`}>
    <path class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M3.72793 2.03781C4.15854 1.91606 4.61763 2.09522 4.85195 2.47646L11.9911 14.092L19.1486 2.47551C19.3833 2.0947 19.8423 1.91602 20.2726 2.03796C20.703 2.1599 21 2.55279 21 3.00009V21.0001C21 21.5524 20.5523 22.0001 20 22.0001C19.4477 22.0001 19 21.5524 19 21.0001V6.52937L12.8414 16.5247C12.6592 16.8203 12.3367 17.0003 11.9894 17.0001C11.6422 16.9999 11.3199 16.8196 11.138 16.5237L5 6.53689V21.0001C5 21.5524 4.55228 22.0001 4 22.0001C3.44772 22.0001 3 21.5524 3 21.0001V3.00009C3 2.55259 3.29731 2.15956 3.72793 2.03781Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    <path class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M1 21C1 20.4477 1.44772 20 2 20H6C6.55228 20 7 20.4477 7 21C7 21.5523 6.55228 22 6 22H2C1.44772 22 1 21.5523 1 21Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    <path class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M17 21C17 20.4477 17.4477 20 18 20H22C22.5523 20 23 20.4477 23 21C23 21.5523 22.5523 22 22 22H18C17.4477 22 17 21.5523 17 21Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    <path class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M1 3C1 2.44772 1.44772 2 2 2H7C7.55228 2 8 2.44772 8 3C8 3.55228 7.55228 4 7 4H2C1.44772 4 1 3.55228 1 3Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
    <path class:path-fill={color ? false : true} style={`${color ? `fill: ${color};` : ""}`} d="M16 3C16 2.44772 16.4477 2 17 2H22C22.5523 2 23 2.44772 23 3C23 3.55228 22.5523 4 22 4H17C16.4477 4 16 3.55228 16 3Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
</svg>
