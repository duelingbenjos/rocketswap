<script>
    export let width = "24px";
    export let height = "24px";
    export let margin = "0";
    export let padding = "0";
    export let color = '#fff';
    export let direction = "left"

    const directionMap = {
      'up' : 180,
      'right': -90,
      'down': 0,
      'left': 90,
    }

    $: rotation = directionMap[direction] || 0
</script>

<div style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`}>
  <svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 21 21">
    <g id="Group_3" data-name="Group 3" transform={`translate(17.999) rotate(90)`}>
      <path fill={color} id="Path_3" data-name="Path 3" d="M20.473,8.683,11.886.124a.434.434,0,0,0-.468-.093.429.429,0,0,0-.264.4V5.147H.429A.429.429,0,0,0,0,5.576V12.44a.429.429,0,0,0,.429.429H11.154v4.7a.43.43,0,0,0,.265.4.423.423,0,0,0,.164.033.432.432,0,0,0,.3-.125l8.587-8.584a.43.43,0,0,0,0-.607Z" transform="translate(0 0)"/>
    </g>
  </svg>
</div>

