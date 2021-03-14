<script>
	import { setContext } from 'svelte'

	// Components
	import PoolMain from '../components/pools/pool-main.svelte'

	$: pageTitle = 'RocketSwap: You Liqidity'
	$: pageDescription = "View your Rocketswap liquidity pools!"

	setContext("pageContext", {
		adjustLiquidityRedirect,
		removeLiquidityRedirect
	})

	function adjustLiquidityRedirect (contract) {
		window.location.assign(`/#/pool-add/${contract}`)
	}

	function removeLiquidityRedirect (contract) {
		window.location.assign(`/#/pool-remove/${contract}`)
	}


	
</script>


<svelte:head>
	<title>{pageTitle}</title>

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{pageTitle}" />
	<meta name="twitter:description" content="{pageDescription}" />
	<meta name="twitter:site" content="@RSwapOfficial" />
	<meta name="twitter:creator" content="Lamden Community" />
	<meta name="twitter:image" content="/assets/images/RS_Logo_192.png" />
	<meta name="twitter:image:alt" content="/assets/images/RS_Logo_192.png" />

	<meta property="og:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{pageTitle}" />
	<meta property="og:image" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:description" content="{pageDescription}" />
	<meta property="og:image:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:secure_url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:width" content="192" />
	<meta property="og:image:height" content="192" />
	<meta property="og:image:type" content="image/png" />
</svelte:head>

<PoolMain />
