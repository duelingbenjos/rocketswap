<script>
    export let margin = "0";
    export let styles = "";
</script>

<style>
    div{
        background-image: url(/assets/images/RS_Logo.png);
        background-repeat: no-repeat;
        background-size: contain;
        border: 2px solid var(--text-primary-color);
        border-radius: 99px;
        width: 80px;
        height: 80px;
        min-width: 80px;
        min-height: 80px;
    }
    @media screen and (min-width: 430px) {
        div{
            width: 90px;
            height: 90px;
            min-width: 90px;
            min-height: 90px;
        }
    }
</style>

<div style={`${styles} margin: ${margin}`}></div>