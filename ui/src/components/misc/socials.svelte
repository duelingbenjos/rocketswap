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
    <a href="https://twitter.com/RSwapOfficial" rel="noopener noreferrer" target="_blank">
        <TwitterIcon {width} margin={iconMargin} {color}/>
    </a>
    <a href="https://t.me/rocketswap" rel="noopener noreferrer" target="_blank">
        <TelegramIcon {width} margin={iconMargin} {color} {stroke}/>
    </a>

    <a href="https://rswp-io.medium.com/" rel="noopener noreferrer" target="_blank">
        <MediumIcon {width} margin={iconMargin} {color} />
    </a>
    
    
</div>