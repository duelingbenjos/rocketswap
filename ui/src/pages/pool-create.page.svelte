<script lang="ts">
  import { pool_panel_store } from '../store'

  //components
  import PoolSwapPanel from '../components/pool-swap-panel.svelte'
  import PoolStats from '../components/pool-stats.svelte'

  //icons
  import IconBackArrow from '../icons/back-arrow.svelte'

  pool_panel_store.subscribe((update) => {
    let selected_token = $pool_panel_store?.slot_b?.selected_token || undefined;
    console.log(selected_token)
    if (selected_token?.has_market) location.assign(`/#/pool-add/${selected_token.contract_name}`)
  })
</script>

<style>
  div{
    width: 89%;
    margin: 0 auto;
  }
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



<PoolSwapPanel content="all_tokens_no_market">
  <div class="header" slot="header">
    <a href="/#/pool-main">
      <IconBackArrow />
    </a>
    <h2>Create Liquidity</h2>
    <IconBackArrow color="transparent"/>
  </div>
  <div class="footer" slot="footer">
    <PoolStats statList={["ratios"]} title={"Prices"}/>
  </div>
</PoolSwapPanel>



