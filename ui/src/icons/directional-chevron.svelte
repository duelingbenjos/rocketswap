<script>
    export let width = "24px";
    export let height = "24px";
    export let margin = "0";
    export let padding = "0";
    export let direction = "left"

    const directionMap = {
      'up' : 180,
      'right': -90,
      'down': 0,
      'left': 90,
    }

    $: rotation = directionMap[direction] || 0
</script>

<style>
    path{
        fill: var(--text-primary-color);
    }
</style>

<div style={`transform: rotate(${rotation}deg); margin: ${margin}; padding: ${padding};`}>
    <svg {width} {height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.485 9.76">
    <path id="Path_1" data-name="Path 1" d="M15.118,83.339l-.745-.746a1.273,1.273,0,0,0-.9-.368,1.218,1.218,0,0,0-.895.368L7.743,87.424,2.912,82.594a1.218,1.218,0,0,0-.895-.368,1.273,1.273,0,0,0-.9.368l-.736.746a1.234,1.234,0,0,0-.378.9,1.181,1.181,0,0,0,.378.894l6.47,6.471a1.182,1.182,0,0,0,.895.378,1.234,1.234,0,0,0,.9-.378l6.471-6.471a1.218,1.218,0,0,0,.368-.894A1.273,1.273,0,0,0,15.118,83.339Z" transform="translate(0 -82.226)"/>
    </svg>
</div>




