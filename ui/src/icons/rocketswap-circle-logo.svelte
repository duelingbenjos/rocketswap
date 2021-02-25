<script>
    export let width = "24px";
    export let margin = "0";
    export let styles = "";

    $: height = width
</script>

<style>
    div{
        background-image: url(/assets/images/RS_Logo.png);
        background-size: contain;
        border: 2px solid var(--text-primary-color);
        border-radius: 99px;
        width: 90px;
        height: 90px;
    }
</style>

<div style={`${styles} margin: ${margin}`}></div>