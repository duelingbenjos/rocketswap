<script>
    import { genericIcon_base64_svg } from '../config'

    export let tokenMeta;
    export let width = '24px';
    export let margin = '0 10px';
    export let inline = false;
    export let lpBottom = "-6px";
    export let stakingContractType = ""

    let height = width;
    let brokenLogo = false;
    let widthNum = parseInt(width.split("px")[0])

    $: svgLogo = tokenMeta ? tokenMeta.token_base64_svg || undefined : undefined;
    $: pngLogo = tokenMeta ? tokenMeta.token_base64_png || undefined : undefined;
    $: urlB64Logo = tokenMeta ? tokenMeta.logo_base64_url || undefined : undefined;
    $: urlLogo = tokenMeta ? tokenMeta.token_logo_url || undefined : undefined;
    $: componentLogo = tokenMeta ? tokenMeta.logo_component || undefined : undefined;

    $: placeholderLogo = !svgLogo && !pngLogo && !urlLogo && !urlB64Logo && !componentLogo ? genericIcon_base64_svg : undefined;

    const logoBroken = (e) => {
        brokenLogo = true
    }
</script>

<style>
    div{
        position: relative;
        display: inline;
    }
    img{
        border-radius: 99px;
    }
    .inline{
        position: relative;
        top: 6px;
    }
    p{
        position: absolute;
        margin: 0;
        color: var(--color-primary-light);
        font-weight: 900;
        left: 50%;
        transform: translateX(-50%);
        background: rgb(0 0 0 / 58%);
        border-radius: 49px;
        z-index: 1;
    }
</style>

<div style={`margin: ${margin}; width: ${width}; height: ${height};`}>
    {#if stakingContractType === "liquidity_mining_smart_epoch"}
        <p style={`
        font-size: ${widthNum <= 27 ? "8px" : "var(--text-size-small)"};
        padding: ${widthNum <= 27 ? "0px 3px" : "0px 5px"};
        bottom: ${lpBottom}
        `}>LP</p>
    {/if}
    {#if (svgLogo || pngLogo)}
        {#if svgLogo}   
            <img  {width} {height} class:inline={inline} src="{`data:image/svg+xml;base64,${svgLogo}`}" alt="token logo"/>
        {/if}

        {#if pngLogo}   
            <img {width} {height} class:inline={inline} src="{`data:image/png;base64,${pngLogo}`}" alt="token logo"/>
        {/if}
    {:else}
        {#if urlB64Logo}   
            <img {width} {height} class:inline={inline} src="{urlB64Logo}" alt="token logo"/>
        {/if}

        {#if urlLogo && !urlB64Logo && !brokenLogo}  
            <img {width} {height} class:inline={inline} src="{urlLogo}" alt="token logo" on:error={logoBroken}/>
        {/if}

        {#if brokenLogo}
            <img {width} {height} class:inline={inline} src="{`data:image/svg+xml;base64,${genericIcon_base64_svg}`}" alt="token logo"/>
        {/if}

    {/if}

    {#if componentLogo}
        <div class:inline={inline} >
            <svelte:component this={componentLogo} {width} {height} margin={"0"}/>
        </div>
    {/if}

    {#if placeholderLogo}   
        <img {width} {height} class:inline={inline} src="{`data:image/svg+xml;base64,${genericIcon_base64_svg}`}" alt="token logo"/>
    {/if}
</div>



