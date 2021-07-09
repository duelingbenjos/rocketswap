<script>
    export let width = "24px";
    export let margin = "0";
    export let color = "var(--color-primary)"
    export let click = () => {}
</script>

<style>
    div{
        cursor: pointer;
    }
</style>

<div style={`width: ${width}; height: ${width}; margin: ${margin};`} on:click={click}>
    <svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.87866 14.1213L14.1213 9.8787" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.87866 9.87866L14.1213 14.1213" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>    
</div>
