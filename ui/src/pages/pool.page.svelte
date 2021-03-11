<script>
	import { setContext } from 'svelte'

	// Components
	import PoolMain from '../components/pools/pool-main.svelte'

	$: pageTitle = 'RocketSwap Liqidity'

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
</svelte:head>

<PoolMain />
