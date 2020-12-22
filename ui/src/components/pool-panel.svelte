<script lang="ts">
  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import PoolButtons from './Pool-buttons.svelte'
  import { pool_panel_store } from '../store'

  function switchPositions() {
    const pool_panel = $pool_panel_store
    pool_panel.slot_a.position = pool_panel.slot_a.position === 'from' ? 'to' : 'from'
    pool_panel.slot_b.position = pool_panel.slot_a.position === 'from' ? 'to' : 'from'
    pool_panel_store.set(pool_panel)
  }

  pool_panel_store.subscribe((update) => console.log(update))
</script>

<div class="container">
  <Input label=" " position="from" context="pool" />
  <br />
  <Input label=" " position="to" context="pool" />
  <Quote showSwitch={false} />
  <PoolButtons buttonFunction="create" />
</div>

<style>
  .container {
    margin-top: 15px;
    background-color: #875dd6;
    width: 444px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
  }

  @media screen and (max-width: 800px) {
    .container {
      height: 100%;
      width: 100%;
      border-radius: 0px;
    }
  }
</style>
