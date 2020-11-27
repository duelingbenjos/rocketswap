<script lang="ts">
  
  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import SwapButtons from './swap-buttons.svelte'

</script>

<div class="container">
  <Input />
  <div class="switch-symbols-cont"><button><img src="/assets/images/down-arrow.svg" alt="" /> </button></div>
  <Input />
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
    /* height: 556px; */
    width: 556px;
    border-radius: 60px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 50px;
    /* display: flex; */
    /* flex-direction: column;
    align-content: center; */
  }

  button,
  input[type='submit'],
  input[type='reset'] {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
