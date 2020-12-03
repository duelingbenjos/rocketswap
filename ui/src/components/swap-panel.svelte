<script lang="ts">
  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import SwapButtons from './swap-buttons.svelte'
  import { swap_panel_store } from '../store'

  function switchPositions() {
    const swap_panel = $swap_panel_store
    swap_panel.slot_a.position = swap_panel.slot_a.position === 'from' ? 'to' : 'from'
    swap_panel.slot_b.position = swap_panel.slot_a.position === 'from' ? 'to' : 'from'
    swap_panel_store.set(swap_panel)
  }
</script>

<div class="container">
  <Input position="from" />
  <div class="switch-symbols-cont"><button on:click={switchPositions}><img src="/assets/images/down-arrow.svg" alt="" /> </button></div>
  <Input position="to" />
  <Quote />
  <SwapButtons />
</div>

<style>
  .switch-symbols-cont {
    margin: 0 auto;
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }

  .container {
    background-color: #875dd6;
    width: 444px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
  }

  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }

  @media screen and (max-width: 800px) {
  .container {
    height: 100%;
    width: 100%;
    border-radius: 0px;
  }
}
</style>
