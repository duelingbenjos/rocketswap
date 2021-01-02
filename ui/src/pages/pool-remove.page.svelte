<script lang="ts">
	import { onMount, setContext } from 'svelte'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();

	//Stores
	import { wallet_store } from '../store'

	//Components
	import PoolSwapPanel from '../components/pool-swap-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import PoolButtons from '../components/pool-buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

	let pageState = {};

	$: contractName = $params.contract
	$: getTokenBalance = refreshTokenBalance($wallet_store)
	$: pageTitle = pageState.selectedToken ? `RocketSwap TAU/${pageState.selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
	$: addHref = pageState.selectedToken ? `/#/pool-add/${pageState.selectedToken.contract_name}` : `/#/pool-add`;

	setContext('pageContext', {
		getTokenList: async () => await walletService.apiService.getMarketList(),
		determineValues: true
	});

	onMount(() => {
		if (contractName) refreshTokenInfo()
	})

	async function handleInfoUpdate(e) {
		if (e.detail.selectedToken){
			let tokenRes = await getTokenInfo(e.detail.selectedToken.contract_name)
			applyTokenBalance(tokenRes)
			const { token: selectedToken, lp_info: tokenLP }  = tokenRes
			pageState = Object.assign(pageState, e.detail, {selectedToken, tokenLP} )
		}else{
			pageState = Object.assign(pageState, e.detail)
		}
		updateWindowHistory()
	}

	const refreshTokenInfo = async () => {
		let tokenRes = await getTokenInfo(contractName)
		applyTokenBalance(tokenRes)
		const { token: selectedToken, lp_info: tokenLP }  = tokenRes
		pageState = Object.assign(pageState, {selectedToken, tokenLP} )
	}

	const applyTokenBalance = (tokenRes) => {
		if ($wallet_store.init) tokenRes.token.balance = 0
		else tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;
		return tokenRes
	}

	const getTokenInfo = async (contractName) => {
		return walletService.apiService.getToken(contractName)
	}

  const refreshTokenBalance = () => {
    if (!pageState.selectedToken) return
    let newBal = $wallet_store?.tokens?.balances[pageState.selectedToken.contract_name] || 0;
    if (newBal !== pageState.selectedToken.balance) pageState.selectedToken.balance = newBal
  }

  const updateWindowHistory = () => {
    if (pageState.selectedToken){
      if (!location.pathname.includes(pageState.selectedToken.contract_name))
        window.history.pushState("", "", `/#/pool-add/${pageState.selectedToken.contract_name}`);
    }
  }

</script>

<style>
  div.header{
    position: relative;
    height: 35px;
    margin: 0 0 1rem;
  }
  div.footer{
    padding-top: 1rem;
  }
  h2{
    position: absolute;

    width: 100%;
    height: 100%;
    margin: 0;

    display: flex;
    justify-content: center;
    align-items: center;

  }
  .controls{
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
  }
  a{
    height: 24px;
  }
</style>


<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="page-container">
  <PoolSwapPanel on:infoUpdate={handleInfoUpdate} {pageState}>
    <div class="header" slot="header">
      <h2>
        Remove Liquidity
      </h2>
      <div class="controls flex-row">
        <a href="/#/pool-main">
          <IconBackArrow />
        </a>
        <a href={addHref} class="text-link underline" >add</a>
      </div>
    </div>
    
    <div class="footer" slot="footer">
      {#if pageState.selectedToken && pageState.tokenLP}
        <PoolStats {pageState} statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>
      {/if}
      <PoolButtons buttonFunction="add" {pageState} />
    </div>
  </PoolSwapPanel>
</div>



