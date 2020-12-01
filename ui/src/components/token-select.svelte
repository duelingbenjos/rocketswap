<script lang="ts">
  import type { TokenListType } from '../types/api.types'
  import { onDestroy, onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { show_token_select_store, token_list_store } from '../store'

  let token_list_unsub
  let token_list: TokenListType[] = []

  onMount(() => {
    token_list_unsub = token_list_store.subscribe((update) => {
      token_list = update
      console.log(token_list)
    })
  })

  onDestroy(() => {
    token_list_unsub()
  })

  function closeModal() {
    show_token_select_store.set(false)
  }
</script>

<div class="token-select-wrapper" transition:fly={{ y: 50, duration: 500 }}>
  <div class="heading">
    <span> Select a token </span>
    <button
      class="nostyle"
      on:click={closeModal}>
      <img src="assets/images/cancel.svg" alt="" /></button>
  </div>

  <div class="select-heading">Token Name</div>
  <hr />
  <div class="token-scroll">
    <div class="token-list">
      {#each token_list as token}
        <div class="token-container"><span class="token-symbol"> {token.token_symbol.toUpperCase()} </span> <span class="token-amount"> 0 </span></div>
      {/each}
    </div>
  </div>
</div>

<style>
  .token-symbol {
    font-weight: 600;
  }
  .token-amount {
    font-weight: 400;
  }
  .token-container {
    width: 85%;
    display: flex;
    padding: 10px;
    justify-content: space-between;
  }

  .token-scroll {
    height: 100%;
    overflow-y: scroll;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .token-scroll::-webkit-scrollbar {
    display: none;
  }

  .token-list {
    padding-top: 15px;
    /* max-height: 300px; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .heading {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding-bottom: 30px;
  }

  .select-heading {
    width: 100%;
    justify-content: space-between;
    padding-bottom: 15px;
  }

  .token-select-wrapper {
    min-height: 600px;
    height: 70%;
    width: 370px;
    padding: 30px;
    border-radius: 30px;
    background-color: #312a43;
    display: flex;
    flex-direction: column;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    color: #d9d9d9;
    font-size: 1.2em;
    font-weight: 200;
    overflow-x: hidden;
    /* overflow-y: scroll; */
  }

  hr {
    margin-left: -30px;
    width: 480px;
    border-top: 0.5px solid #d9d9d90a;
  }
</style>
