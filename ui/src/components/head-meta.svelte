<script>
    import { config, site_head_meta } from '../config'

    export let pageTitle
    export let pageDescription

</script>

<svelte:head>
	<title>{pageTitle}</title>

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{pageTitle}" />
	<meta name="twitter:description" content="{pageDescription}" />
	<meta name="twitter:site" content="@RSwapOfficial" />
	<meta name="twitter:creator" content="Lamden Community" />
	<meta name="twitter:image" content="{site_head_meta.siteLogo}" />
	<meta name="twitter:image:alt" content="{site_head_meta.siteLogo}" />

	<meta property="og:url" content="{config.domainName}" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{pageTitle}" />
	<meta property="og:image" content="{site_head_meta.imageBig}" />
	<meta property="og:description" content="{pageDescription}" />
	<meta property="og:image:url" content="{site_head_meta.imageBig}" />
	<meta property="og:image:secure_url" content="{site_head_meta.imageBig}" />
	<meta property="og:image:width" content="192" />
	<meta property="og:image:height" content="192" />
	<meta property="og:image:type" content="image/png" />
</svelte:head>