<script>
	import { setContext } from 'svelte'

	// Components
	import HeadMeta from '../components/head-meta.svelte'
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


<HeadMeta {pageTitle} {pageDescription} />

<PoolMain />
