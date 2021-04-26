<script>
    export let width = "24px";
    export let margin = "0";
    export let opacity = 1;
    export let color = "var(--text-primary-color-dim)"

</script>

<style>
    .fire{
        animation: fire 1s ease-in-out infinite;
    }
    @keyframes fire {
        0% { fill: red;}
        33% { fill:yellow; }
        66% { fill:red; }
        100% { fill: orange; }
    }
</style>

<svg {width} fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" xml:space="preserve"
    style={`margin: ${margin}; opacity: ${opacity}; fill: ${color}; enable-background:new 0 0 100 100;`}>
    <g>
        <g>
            <path class="fire" d="M52.7,65.1h-4.4c-2.1,0-4,1.4-4.5,3.5v0c-1.8,7.2-0.8,14.7,2.9,21.1l2.7,4.6c0.5,0.8,1.7,0.8,2.1,0l2.7-4.6    c3.7-6.4,4.8-14,2.9-21.1C56.7,66.6,54.8,65.1,52.7,65.1z"></path>
            <path d="M38,59.8c0.2,0.9,1,1.5,2,1.5l6.3-0.4c2.9-0.2,5.8-0.2,8.7,0l6,0.4c0.9,0.1,1.8-0.5,2-1.4c4.3-17.5,1-36-9.1-50.9    l-2.2-3.2c-0.6-0.8-1.8-0.8-2.4,0l-1.8,2.6C37.3,23.4,33.8,42,38,59.8L38,59.8z M50.3,22.6c3.3,0,6,2.7,6,6c0,3.3-2.7,6-6,6    s-6-2.7-6-6C44.3,25.2,47,22.6,50.3,22.6z"></path>
            <path d="M66,54.5l8.2,3.5c0.9,0.5,1.9-0.3,1.7-1.3l-0.6-3.3c-1-5.4-4-10.3-8.4-13.6c-0.4-0.3-0.9,0-0.8,0.5    c0.4,4.4,0.3,8.9-0.2,13.4l0,0.2C65.7,54.2,65.8,54.4,66,54.5z"></path>
            <path d="M26.6,58l8.2-3.5c0.2-0.1,0.3-0.4,0.3-0.6l0-0.2c-0.6-4.4-0.6-8.9-0.2-13.4c0.1-0.5-0.4-0.8-0.8-0.5    c-4.4,3.3-7.4,8.2-8.4,13.6l-0.6,3.3C24.7,57.7,25.7,58.5,26.6,58z"></path>
        </g>
    </g>
</svg>