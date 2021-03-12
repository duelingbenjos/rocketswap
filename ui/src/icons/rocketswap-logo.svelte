<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-secondary)"
    export let reverse = false;
    export let styles = "";
</script>

<style>
    .reverse{
        -webkit-transform: scaleX(-1) scaleY(-1);
        transform: scaleX(-1) scaleY(-1);        
    }

</style>

<svg {width} fill={color} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"
     style={`margin: ${margin}; ${styles}`}
     class:reverse={reverse}>
    <g>
        <path d="M89.7,17.7c-0.9,16-4.5,27.3-20.5,40.3c0,6.8-2.7,13.6-8.2,18.4l-9.1-10.2c-1.9,1.8-4.4,2.7-6.8,2.8    c-3.2,0.1-6.3-1.1-8.6-3.6c-4-4.5-3.6-11.4,0.8-15.4l-9.1-10.2c5.5-4.9,12.5-6.9,19.3-6.1C62.1,19.2,73.7,16.8,89.7,17.7z     M73.1,42.3c3-2.7,3.2-7.2,0.6-10.2c-1.5-1.6-3.5-2.5-5.7-2.4c-1.7,0.1-3.3,0.7-4.5,1.8c-3,2.7-3.2,7.2-0.6,10.2    c1.5,1.6,3.5,2.5,5.7,2.4C70.2,44,71.8,43.4,73.1,42.3z"></path>
    </g>
    <g>
        <path d="M14.6,84.4l0.5-1.6c0.1-0.4,2.9-9.9,6.5-13.6c2-2,4.4-3.1,6.6-3.1c1.4,0,2.5,0.4,3.4,1.3c2.3,2.3,1.5,6.7-1.8,10   c-3.9,3.9-13.2,6.4-13.6,6.6L14.6,84.4z"></path>
    </g>
</svg>