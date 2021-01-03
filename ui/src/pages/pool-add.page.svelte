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
  
  //Misc
  import { stringToFixed, quoteCalculator, toBigNumber } from '../utils'

	//Components
	import PoolSwapPanel from '../components/pool-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import PoolButtons from '../components/pool-buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState = {};
  let pageStats = writable()
  let resetInputAmounts

	$: contractName = $params.contract
	$: getTokenBalance = refreshTokenBalance($wallet_store)
	$: pageTitle = pageState.selectedToken ? `RocketSwap TAU/${pageState.selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
  $: removeHref = pageState.selectedToken ? `/#/pool-remove/${pageState.selectedToken.contract_name}` : `/#/pool-remove`;
  

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
    determineValues: true,
    pageStats,
    resetPage
	});

	onMount(() => {
		if (contractName) refreshTokenInfo()
  })
  
  function resetPage () {
    resetInputAmounts()
    setTimeout(refreshTokenInfo, 2000)
  }

	async function handleInfoUpdate(e) {
		if (e.detail.selectedToken){
			let tokenRes = await getTokenInfo(e.detail.selectedToken.contract_name)
			applyTokenBalance(tokenRes)
			const { token: selectedToken, lp_info: tokenLP }  = tokenRes
      pageState = Object.assign(pageState, e.detail, {selectedToken, tokenLP} )
      updateStatsStore()
		}else{
			pageState = Object.assign(pageState, e.detail)
		}
		updateWindowHistory()
  }
  
  const updateStatsStore = async () => {
    const { currencyAmount, tokenAmount, tokenLP, selectedToken } = pageState

    let lp_balances = await setLpBalances();
    let lp_balance = lp_balances[selectedToken.contract_name]

    let quoteCalc = quoteCalculator(tokenLP)
    let lpToMint = quoteCalc.calcNewLpMintAmount(currencyAmount)

    let currentLpSharePercent = "0"
    let newLpSharePercent = "0%"

    if (lp_balance) {
      currentLpSharePercent = stringToFixed(quoteCalc.calcLpPercent(lp_balance).multipliedBy(100), 1)
      newLpSharePercent = stringToFixed(quoteCalc.calcNewShare(lp_balance, currencyAmount).multipliedBy(100), 1) + "%"
    } else {
      lp_balance = toBigNumber("0")
    }

    pageStats.set({
      quoteCalc,
      lp_balances,
      lp_balance,
      currentLpSharePercent,
      newLpSharePercent,
      lpToMint
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
		applyTokenBalance(tokenRes)
		const { token: selectedToken, lp_info: tokenLP }  = tokenRes
    pageState = Object.assign(pageState, {selectedToken, tokenLP} )
    updateStatsStore();
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
  <PoolSwapPanel on:infoUpdate={handleInfoUpdate} {pageState} bind:resetInputAmounts>
    <div class="header" slot="header">
      <h2>
        Add Liquidity
      </h2>
      <div class="controls flex-row">
        <a href="/#/pool-main">
          <IconBackArrow />
        </a>
        <a href={removeHref} class="text-link underline" >remove</a>
      </div>
    </div>
    
    <div class="footer" slot="footer">
      {#if pageState.selectedToken && pageState.tokenLP}
        <PoolStats {pageState} statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>
      {/if}
      <PoolButtons buttonFunction="add" {...pageState} />
    </div>
  </PoolSwapPanel>
</div>



