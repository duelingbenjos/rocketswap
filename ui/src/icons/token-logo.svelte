<script>
    import { genericIcon_base64_svg } from '../config'

    export let tokenMeta;
    export let width = '24px';
    export let margin = '0 10px';

    let height = width;
    
    $: svgLogo = tokenMeta ? tokenMeta.token_base64_svg || undefined : undefined;
    $: pngLogo = tokenMeta ? tokenMeta.token_base64_png || undefined : undefined;
    $: urlB64Logo = tokenMeta ? tokenMeta.logo_base64_url || undefined : undefined;
    $: urlLogo = tokenMeta ? tokenMeta.token_logo_url || undefined : undefined;
    $: componentLogo = tokenMeta ? tokenMeta.logo_component || undefined : undefined;

    $: placeholderLogo = !svgLogo && !pngLogo && !urlLogo && !urlB64Logo && !componentLogo ? genericIcon_base64_svg : undefined;
</script>

<style>
    img{
        border-radius: 99px;
    }
</style>

{#if svgLogo || pngLogo}
    {#if svgLogo}   
        <img style={`margin: ${margin};`} {width} {height} src="{`data:image/svg+xml;base64,${svgLogo}`}" alt="token logo"/>
    {/if}

    {#if pngLogo}   
        <img style={`margin: ${margin};`} {width} {height} src="{`data:image/png;base64,${pngLogo}`}" alt="token logo"/>
    {/if}
{:else}
    {#if urlB64Logo}   
        <img style={`margin: ${margin};`} {width} {height} src="{urlB64Logo}" alt="token logo"/>
    {/if}

    {#if urlLogo && !urlB64Logo}   
        <img style={`margin: ${margin};`} {width} {height} src="{urlLogo}" alt="token logo"/>
    {/if}
{/if}

{#if componentLogo}
    <svelte:component this={componentLogo} {width} {margin} {height}/>
{/if}

{#if placeholderLogo}   
    <img style={`margin: ${margin};`} {width} {height} src="{`data:image/svg+xml;base64,${placeholderLogo}`}" alt="token logo"/>
{/if}



