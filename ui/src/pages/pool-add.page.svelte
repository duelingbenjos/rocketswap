<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { writable } from 'svelte/store'

	//Router
	import { params, active } from 'svelte-hash-router'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Stores
  import { walletIsReady, lwc_info, tokenBalances, lpBalances, saveStoreValue } from '../store'
  
  //Misc
  import { stringToFixed, quoteCalculator, toBigNumber, pageUtils, refreshLpBalances } from '../utils'

	//Components
	import PoolSwapPanel from '../components/pool-liquidity-panel.svelte'
	import PoolStats from '../components/pool-stats.svelte'
	import Buttons from '../components/buttons.svelte'
	import IconBackArrow from '../icons/back-arrow.svelte'

  let pageStats = writable()
  let currencyAmount = writable(null)
  let tokenAmount = writable(null)
  let selectedToken = writable()
  let tokenLP = writable()
  let lpBalance = writable()

  let pageStores = {
    currencyAmount,
    tokenAmount,
    selectedToken,
    tokenLP,
    lpBalance
  }

  let pageUtilites = pageUtils(pageStores)

	$: contractName = $params.contract
	$: pageTitle = $selectedToken ? `RocketSwap TAU/${$selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
  $: removeHref = $selectedToken ? `/#/pool-remove/${$selectedToken.contract_name}` : false;
  $: updateStats = updatePageStats($walletIsReady, $tokenLP, $lpBalances, $currencyAmount)

  selectedToken.subscribe(value => {
    if (value) pageUtilites.refreshTokenInfo(value.contract_name)
  })

	setContext('pageContext', {
		getTokenList: async () => await apiService.getMarketList(),
    determineValues: true,
    pageStats,
    resetPage: () => pageUtilites.resetPage(contractName, [currencyAmount, tokenAmount]),
    pageStores,
    saveStoreValue
  });

  onMount(() => {
    if (contractName) pageUtilites.refreshTokenInfo(contractName)
  })

  async function updatePageStats() {
    let quoteCalc = quoteCalculator($tokenLP)
    let lpToMint = quoteCalc.calcNewLpMintAmount($currencyAmount)

    let balance = $lpBalances[contractName]
    let currentLpSharePercent = "0"
    let newLpSharePercent = "0%"

    if (balance) {
      saveStoreValue(lpBalance, balance)
      currentLpSharePercent = stringToFixed(quoteCalc.calcLpPercent(balance).multipliedBy(100), 1)
      newLpSharePercent = stringToFixed(quoteCalc.calcNewShare(balance, $currencyAmount).multipliedBy(100), 1)
    } else saveStoreValue(lpBalance, toBigNumber("0"))

    pageStats.set({
      quoteCalc,
      lp_balance: balance,
      currentLpSharePercent,
      newLpSharePercent,
      lpToMint
    })
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
  a{
    height: 24px;
  }
</style>


<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="page-container">
  <PoolSwapPanel>
    <div class="header" slot="header">
      <span class="page-heading">Add Liquidity</span>
      <div class="page-controls flex-row">
        <a href="/#/pool-main/">
          <IconBackArrow />
        </a>
        {#if removeHref}
          <a href={removeHref} class="text-link underline" >remove</a>
        {/if}
      </div>
    </div>
    
    <div class="footer" slot="footer">
      {#if $selectedToken && $tokenLP}
        <PoolStats statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>
      {/if}
      <Buttons buttonFunction="add" buttonText="Add Supply"  />
    </div>
  </PoolSwapPanel>
</div>



