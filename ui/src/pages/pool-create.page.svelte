<script lang="ts">
  import {onMount, setContext, beforeUpdate } from 'svelte'
  import { writable } from 'svelte/store'

  //Router
  import { params } from 'svelte-hash-router'

  //Stores
  import { wallet_store } from '../store'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

  //Components
  import PoolSwapPanel from '../components/pool-liquidity-panel.svelte'
  import PoolStats from '../components/pool-stats.svelte'
  import PoolButtons from '../components/Pool-buttons.svelte'

  //Icons
  import IconBackArrow from '../icons/back-arrow.svelte'

  //Misc
  import { quoteCalculator } from '../utils'

  let pageState = {};
  let pageStats = writable({})
  let resetInputAmounts;

  $: contractName = $params.contract
  $: getTokenBalance = refreshTokenBalance($wallet_store)
  $: pageTitle = pageState.selectedToken ? `RocketSwap Create ${pageState.selectedToken.token_symbol} Pool` : 'RocketSwap Create Pool';

  setContext('pageContext', {
    getTokenList: async () => await apiService.getTokenList(["no-market"]),
    determineValues: false,
    pageStats,
    resetPage
  });

  onMount(() => {
    if (contractName) refreshTokenInfo(contractName)
  })

  beforeUpdate(() => {
    if(typeof $pageStats === 'undefined') pageStats = writable({});
  })

  function resetPage () {
    resetInputAmounts()
    setTimeout(() => refreshTokenInfo(pageState.selectedToken.contract_name), 2000)
  }

  const handleInfoUpdate = (e) => {
    pageState = Object.assign(pageState, e.detail)
    if (pageState.selectedToken) refreshTokenInfo(pageState.selectedToken.contract_name)
  }

  const refreshTokenInfo = async (contractName) => {
    if (contractName){
      let tokenRes = await apiService.getToken(contractName)

      if (tokenRes.lp_info) {
        redirectToAddPool(tokenRes.token.contract_name)
        return
      }
      if ($wallet_store.init) tokenRes.token.balance = 0
      else tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;

      pageState.selectedToken = tokenRes.token
      pageState.tokenLP = tokenRes.lp_info

      updateStatsStore()
      updateWindowHistory()
    }

  }

  const updateStatsStore = async () => {
    const { currencyAmount, tokenAmount } = pageState
    let quoteCalc = quoteCalculator({reserves: [currencyAmount, tokenAmount]})
    let initialLPToMint = quoteCalc.calcInitialLpMintAmount()

    pageStats.set({
      quoteCalc,
      initialLPToMint
    })
  }

  const refreshTokenBalance = () => {
    if (!pageState.selectedToken) return
    let newBal = $wallet_store?.tokens?.balances[pageState.selectedToken.contract_name] || 0;
    if (newBal !== pageState.selectedToken.balance) pageState.selectedToken.balance = newBal
  }

  const updateWindowHistory = () => {
    if (pageState.selectedToken){
      if (!location.pathname.includes(pageState.selectedToken.contract_name))
        window.history.pushState("", "", `/#/pool-create/${pageState.selectedToken.contract_name}`);
    }
  }

  const redirectToAddPool = (contractName) => window.location.assign(`/#/pool-add/${contractName}`)

</script>

<style>
  div.header{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  div.footer{
    margin-top: 2rem;
    margin-bottom: 2rem;
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
      <a href="/#/pool-main/">
        <IconBackArrow />
      </a>
      <h2>Create Liquidity</h2>
      <IconBackArrow color="transparent"/>
    </div>
    <div class="footer" slot="footer">
      {#if pageState.selectedToken }
        <PoolStats {pageState} statList={["ratios"]} title={"Initial prices and pool share"}/>
      {/if}
      <PoolButtons buttonFunction="create" {...pageState} />
    </div>
  </PoolSwapPanel>
</div>



