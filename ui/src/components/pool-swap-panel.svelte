<script lang="ts">
  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import PoolButtons from './Pool-buttons.svelte'
  import IconPlusSign from '../icons/plus-sign.svelte'
  import { pool_panel_store } from '../store'

  export let content

  function switchPositions() {
    const pool_panel = $pool_panel_store
    pool_panel.slot_a.position = pool_panel.slot_a.position === 'from' ? 'to' : 'from'
    pool_panel.slot_b.position = pool_panel.slot_a.position === 'from' ? 'to' : 'from'
    pool_panel_store.set(pool_panel)
  }
</script>

<style>
  .container {
    margin-top: 15px;
    background-color: #875dd6;
    color: #fff;
    width: 444px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
  }

  .plus-sign{
    text-align: center;
    margin: 1rem 0;
  }

  @media screen and (max-width: 800px) {
    .container {
      height: 100%;
      width: 100%;
      border-radius: 0px;
    }

  }
</style>

<div class="container">
  <slot name="header"></slot>
  <Input label=" " position="from" context="pool" {content} />
  <div class="plus-sign">
    <IconPlusSign width={"20"} height={"20"}/>
  </div>
  <Input label=" " position="to" context="pool" {content} />
  <!--<Quote showSwitch={false} />-->
  <slot name="footer"></slot>
  <PoolButtons buttonFunction="create" />
</div>
