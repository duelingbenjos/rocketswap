<script lang="ts">
  import {onMount } from 'svelte'

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

  //Icons
  import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState = {};

  $: contractName = $params.contract
  $: getTokenBalance = refreshTokenBalance($wallet_store)
  $: pageTitle = pageState.selectedToken ? `RocketSwap TAU/${pageState.selectedToken.token_symbol}` : 'RocketSwap Add Liquidity';
  $: addHref = pageState.selectedToken ? `/#/pool-add/${pageState.selectedToken.contract_name}` : `/#/pool-add`;

  onMount(() => {
    if (contractName) refreshTokenInfo()
  })

  function handleInfoUpdate(e) {
    pageState = Object.assign(pageState, e.detail)
    updateWindowHistory()
  }

  const refreshTokenInfo = async () => {
    let tokenRes = await walletService.apiService.getToken(contractName)
    if ($wallet_store.init) tokenRes.token.balance = 0
    else{
      tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;
    }
    pageState.selectedToken = tokenRes.token
    pageState.tokenLP = tokenRes.lp_info
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
  <PoolSwapPanel on:infoUpdate={handleInfoUpdate} {pageState}>
    <div class="header" slot="header">
      <h2>
        Remove Liquidity
      </h2>
      <div class="controls flex-row">
        <a href="/#/pool-main">
          <IconBackArrow />
        </a>
        <a href={addHref} >add</a>
      </div>
    </div>
    <div class="footer" slot="footer">
      <PoolStats {pageState} statList={["ratios", "poolShare"]} title={"Prices and pool share"}/>
    </div>
  </PoolSwapPanel>
</div>



