<script>
    import TwitterIcon from '../../icons/twitter.svelte'
    import TelegramIcon from '../../icons/telegram.svelte'
    import MediumIcon from '../../icons/medium.svelte'

    export let width;
    export let margin;
    export let iconMargin;
    export let color = null;
    export let stroke = null;

</script>

<style>
    div{
        width: max-content;
    }
</style>

<div style={`margin: ${margin};`}>
    <TwitterIcon {width} margin={iconMargin} {color}/>
    <TelegramIcon {width} margin={iconMargin} {color} {stroke}/>
    <MediumIcon {width} margin={iconMargin} {color} />
</div>