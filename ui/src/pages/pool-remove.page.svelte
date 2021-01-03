<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { writable } from 'svelte/store'

	//Router
	import { params } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Stores
	import { wallet_store } from '../store'

	//Components
  import PoolRemoveLiquidityPanel from '../components/pool-remove-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import PoolButtons from '../components/pool-buttons.svelte'
  import IconBackArrow from '../icons/back-arrow.svelte'
  
  //Misc
  import { quoteCalculator, stringToFixed, toBigNumber } from '../utils'

  let pageState = {};
  let pageStats = writable()

	$: contractName = $params.contract
	$: getTokenBalance = refreshTokenBalance($wallet_store)
	$: pageTitle = pageState.selectedToken ? `RocketSwap TAU/${pageState.selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
	$: addHref = pageState.selectedToken ? `/#/pool-add/${pageState.selectedToken.contract_name}` : `/#/pool-add`;

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
    determineValues: true,
    pageStats,
    resetPage
	});

	onMount(() => {
    if (contractName) refreshTokenInfo()
	})

	async function handleInfoUpdate(e) {
		if (e.detail.selectedToken){
			let tokenRes = await getTokenInfo(e.detail.selectedToken.contract_name)
			applyTokenBalance(tokenRes)
      const { token: selectedToken, lp_info: tokenLP }  = tokenRes
      const { lpTokenPercentInput } = e.detail;
      pageState = Object.assign(pageState, e.detail, {selectedToken, tokenLP, lpTokenPercentInput} )
      if (lpTokenPercentInput) updateStatsStore()
		}else{
			pageState = Object.assign(pageState, e.detail)
		}
  }

  function resetPage () {
    setTimeout(refreshTokenInfo, 1000)
  }
  
  const updateStatsStore = async () => {
    const { tokenAmount, tokenLP, selectedToken, lpTokenPercentInput } = pageState

    let lp_balances = await setLpBalances();
    let lp_balance = lp_balances[selectedToken.contract_name]

    let quoteCalc = quoteCalculator(tokenLP)

    let currentLpSharePercent = "0"
    let newLpSharePercent = "0%"
    let amounts;
    let lpTokenPercent = 0;
    let lpTokenAmount = toBigNumber("0")

    if (lp_balance) {
      lpTokenPercent = lpTokenPercentInput / 100;
      lpTokenAmount = lp_balance.multipliedBy(lpTokenPercent)

      currentLpSharePercent = stringToFixed(quoteCalc.calcLpPercent(lp_balance).multipliedBy(100), 1)
      newLpSharePercent = stringToFixed(quoteCalc.calcNewShare_removeTokens(lp_balance, lpTokenAmount).multipliedBy(100), 1)

      amounts = quoteCalc.calcAmountsFromLpTokens(lpTokenAmount)
    } else {
      lp_balance = toBigNumber("0")
    }

    pageStats.set({
      quoteCalc,
      lp_balances,
      lp_balance,
      lpTokenPercent,
      currentLpSharePercent,
      newLpSharePercent,
      lpTokenAmount,
      amounts
    })

  }

  const setLpBalances = async () => {
    if ($wallet_store.init) return {}
      let vk = $wallet_store?.wallets[0];
      if (vk){
          let balancesRes = await apiService.getUserLpBalance(vk)
          if (balancesRes) return balancesRes.points
          else return {}
      }
  }

	const refreshTokenInfo = async () => {
		let tokenRes = await getTokenInfo(contractName)
    await applyTokenBalance(tokenRes)
		const { token: selectedToken, lp_info: tokenLP }  = tokenRes
    pageState = Object.assign(pageState, {selectedToken, tokenLP} )
    await updateStatsStore()
	}

	const applyTokenBalance = (tokenRes) => {
		if ($wallet_store.init) tokenRes.token.balance = 0
		else tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;
		return tokenRes
	}

	const getTokenInfo = async (contractName) => {
		return apiService.getToken(contractName)
	}

  const refreshTokenBalance = () => {
    if (!pageState.selectedToken) return
    let newBal = $wallet_store?.tokens?.balances[pageState.selectedToken.contract_name] || 0;
    if (newBal !== pageState.selectedToken.balance) pageState.selectedToken.balance = newBal
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
  <PoolRemoveLiquidityPanel on:infoUpdate={handleInfoUpdate} {pageState}>
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
        <!--<PoolStats {pageState} statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>-->
      {/if}
      <PoolButtons buttonFunction="remove" {...pageState} />
    </div>
  </PoolRemoveLiquidityPanel>
</div>



