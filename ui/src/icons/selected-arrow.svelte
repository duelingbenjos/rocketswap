

<script>
    export let width = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "left"

    let height = width;

    const directionMap = {
      'left' : 180,
      'up': -90,
      'right': 0,
      'down': 90,
    }

    $: rotation = directionMap[direction] || 0
</script>

<style>
    path{
        fill: var(--color-primary);
        animation: blinker 2s linear infinite;
    }

    @keyframes blinker {
    50% {
        opacity: 0.5;
    }
}
</style>
<div style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`}>
    <svg xmlns="http://www.w3.org/2000/svg" {width} {height}  viewBox="0 0 12 14">
        <path d="M7,0l7,12H0Z" transform="translate(12) rotate(90)" />
    </svg>
</div>