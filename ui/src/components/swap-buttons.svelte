<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  import { show_swap_confirm, swap_panel_store } from '../store'

  let swap_panel_unsub
  let selected_token, input_a, input_b, button_disabled, button_text
  $: button_disabled = !selected_token || (input_a && input_a <= 0) || !input_a || !input_b || (input_b && input_b <= 0)
  $: button_text = button_disabled ? (!selected_token ? 'Select a token' : 'Enter amount') : 'Swap'
  $: selected_token
  $: input_a
  $: input_b
  onMount(() => {
    swap_panel_unsub = swap_panel_store.subscribe((update) => {
      let token_slot = update.slot_a.role === 'currency' ? update.slot_b : update.slot_a
      selected_token = token_slot.selected_token
      input_a = update.slot_a.input_amount
      input_b = update.slot_b.input_amount
    })
  })
  onDestroy(() => {
    swap_panel_unsub
  })
</script>

<div class="container">
  <button
    disabled={button_disabled}
    class="swap-button"
    on:click={() => {
      show_swap_confirm.set(true)
  }}>{button_text}</button>
</div>

<style>
  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
    z-index: 0;
  }

  button:disabled {
    opacity: 0.7;
  }
  .swap-button {
    width: 100%;
    background-color: #3131d98f;
    /* border: 4px solid #2FBA95; */
    color: #fff;
    height: 3em;
    border-radius: 24px;
    font-size: 1.6em;
    font-weight: 600;
    letter-spacing: 0.1em;
    box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
    -moz-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .container {
    padding: 10px 20px 10px 20px;
  }
</style>
