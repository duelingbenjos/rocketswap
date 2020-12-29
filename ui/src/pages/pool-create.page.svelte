<script lang="ts">
  //components
  import PoolSwapPanel from '../components/pool-swap-panel.svelte'
  import PoolStats from '../components/pool-stats.svelte'

  //icons
  import IconBackArrow from '../icons/back-arrow.svelte'

  let pageState;

  const handleInfoUpdate = (e) => pageState = e.detail

</script>

<style>
  .page-container{
    display: flex;
    justify-content: center;
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


<div class="page-container">
  <PoolSwapPanel on:infoUpdate={handleInfoUpdate}>
    <div class="header" slot="header">
      <a href="/#/pool-main">
        <IconBackArrow />
      </a>
      <h2>Create Liquidity</h2>
      <IconBackArrow color="transparent"/>
    </div>
    <div class="footer" slot="footer">
      <PoolStats {pageState} statList={["ratios"]} title={"Prices"}/>
    </div>
  </PoolSwapPanel>
</div>



