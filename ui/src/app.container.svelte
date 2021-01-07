<script lang="ts">
  import Router from 'svelte-hash-router'
  import Header from './components/header.svelte'
  import Footer from './components/footer.svelte'
  import Dimmer from './components/dimmer.svelte'
  import ToastsContainer from './components/toasts-container.svelte'
  import { onMount, setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { WalletService } from './services/wallet.service'
  import { ApiService } from './services/api.service'
  import { WsService } from './services/ws.service'
  import { show_token_select_store, show_swap_confirm } from './store'
  import type { TokenSelectType } from './types/api.types'

  let show_token_select: TokenSelectType
  let currentThemeName = writable()

  setContext("app", {
    themeToggle,
    currentThemeName
  })
  

  onMount(() => {
    themeSet();
    /** Initialise Singleton Instances */
    WsService.getInstance()
    WalletService.getInstance()
    ApiService.getInstance()
    show_token_select_store.subscribe((update) => {
      show_token_select = update
    })
  })

  function themeToggle() {
    let body = document.getElementById("theme-toggle")
    let lighttheme = getThemeSetting()
    if (!lighttheme) {
      body.classList.add("light");
      currentThemeName.set('light')  
    }
    else {
      body.classList.remove("light");
      currentThemeName.set('dark')
    }
    localStorage.setItem("lighttheme", !lighttheme)
  }

  function themeSet() {
    let body = document.getElementById("theme-toggle")
    let lighttheme = getThemeSetting()
    if (lighttheme) {
      body.classList.add("light");
      currentThemeName.set('light')
    }else currentThemeName.set('dark')
  }

  function getThemeSetting() {
    return JSON.parse(localStorage.getItem("lighttheme"))
  }
</script>

<main>
  <div class="bg-solid">
    <div class="bg-gradient flex">
      {#if show_token_select?.open}
        <Dimmer>
          <TokenSelect content={show_token_select.content}/>
        </Dimmer>
      {/if}
      <Header />
      <Router />
      <ToastsContainer />

    </div>
  </div>
</main>
<Footer />

<style>
  .bg-gradient {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: var(--main-background-gradient);

    overflow-y: scroll;
  }

  .bg-solid {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: var(--main-background-solid);
  }

  .flex {
    display: flex;
    flex-direction: column;
    /* justify-items: space-between; */
    /* justify-content: space-between; */
    align-items: center;
  }

  main {
    height: 100%;
    width: 100%;
  }
</style>
