<script>
  import Router from 'svelte-hash-router'
  import Header from './components/header.svelte'
  import Footer from './components/footer.svelte'
</script>

<main>
  <div class="bg-solid">
    <div class="bg-gradient flex">
      <Header />
      <Router />
      <Footer />
    </div>
  </div>
</main>

<style>
  .bg-gradient {
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: linear-gradient(rgba(233, 43, 247, 0.6), rgba(0, 0, 0, 0));
  }

  .bg-solid {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #120e4a;
  }

  .flex {
    display: flex;
    flex-direction: column;
    justify-items: space-between;
    justify-content: space-between;
    align-items: center;
  }

  main {
    height: 100%;
    width: 100%;
  }
</style>
