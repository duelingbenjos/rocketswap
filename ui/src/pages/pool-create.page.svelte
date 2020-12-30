<script lang="ts">
  import {onMount } from 'svelte'

  //Router
  import { params } from 'svelte-hash-router'

  //Stores
  import { wallet_store } from '../store'

  //Services
  import { WalletService } from '../services/wallet.service'
  const walletService = WalletService.getInstance();

  //Components
  import PoolSwapPanel from '../components/pool-swap-panel.svelte'
  import PoolStats from '../components/pool-stats.svelte'

  //Icons
  import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState = {};

  $: contractName = $params.contract
  $: getTokenBalance = refreshTokenBalance($wallet_store)
  $: pageTitle = pageState.selectedToken ? `RocketSwap Create ${pageState.selectedToken.token_symbol} Pool` : 'RocketSwap Create Pool';

  const handleInfoUpdate = (e) => {
    pageState = Object.assign(pageState, e.detail)
    if (pageState.selectedToken) refreshTokenInfo(pageState.selectedToken.contract_name)
  }

  onMount(() => {
    if (contractName) refreshTokenInfo(contractName)
  })

  const refreshTokenInfo = async (contractName) => {
    let tokenRes = await walletService.apiService.getToken(contractName)

    if (tokenRes.lp_info) {
      redirectToAddPool(tokenRes.token.contract_name)
      return
    }
    if ($wallet_store.init) tokenRes.token.balance = 0
    else tokenRes.token.balance = $wallet_store?.tokens?.balances[tokenRes.token.contract_name] || 0;

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
  <PoolSwapPanel on:infoUpdate={handleInfoUpdate} {pageState}>
    <div class="header" slot="header">
      <a href="/#/pool-main">
        <IconBackArrow />
      </a>
      <h2>Create Liquidity</h2>
      <IconBackArrow color="transparent"/>
    </div>
    <div class="footer" slot="footer">
      {#if pageState.selectedToken }
        <PoolStats {pageState} statList={["ratios"]} title={"Initial prices and pool share"}/>
      {/if}
    </div>
  </PoolSwapPanel>
</div>



