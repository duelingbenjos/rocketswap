<script lang="ts">
  import Header from './components/header.svelte'
  import SwapPanel from './components/swap-panel.svelte'
  import Footer from './components/footer.svelte'
  // export let name: string;
</script>

<main>
  <div class="bg-solid">
    <div class="bg-gradient flex">
      <Header />
      <SwapPanel />
      <Footer />
    </div>
  </div>
</main>

<style>
  main {
    /* background-color: black; */
    height: 100%;
    width: 100%;
  }

  .bg-gradient {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: linear-gradient(rgba(233, 43, 247, 0.433), rgba(0, 0, 0, 0));
  }

  .bg-solid {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #1a127e;
  }

  .flex {
    display: flex;
    flex-direction: column;
    justify-items: space-between;
    justify-content: space-between;
    align-items: center;
  }
</style>
