<script>
    export let width = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "right"
    export let color = "var(--text-primary-color-dim)";

    const directionMap = {
      'left' : 180,
      'up': -90,
      'right': 0,
      'down': 90,
    }
</script>


<div style={` margin: ${margin}; padding: ${padding};`}>
  <svg {width} xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 100 100">
    <path style={`fill: ${color}; `} transform={`rotate(${directionMap[direction]}, 50, 50)`} d="M69.36,18.05a3.54,3.54,0,0,0-2.24-.93,2.88,2.88,0,0,0-3,3V38H0V62H64.13V79.89a3,3,0,0,0,3,3A2.92,2.92,0,0,0,69.27,82L99.16,52.15a3.17,3.17,0,0,0,0-4.3Z"></path>
  </svg>
</div>

