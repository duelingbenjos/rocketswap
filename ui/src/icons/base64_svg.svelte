<script>
    import { genericIcon_base64_svg } from '../config'

    export let string;
    export let width = '24px';
    export let height = '24px';
    export let margin = '0 10px';
    
    $: logo_string = string || genericIcon_base64_svg;

</script>

<img style={`margin: ${margin};`} {width} {height} src="{`data:image/svg+xml;base64,${logo_string}`}" alt="token logo"/>