<script lang="ts">
  import { afterUpdate } from 'svelte'

  import { routes, active } from 'svelte-hash-router'
  let links: any[]
  $: links = Object.values($routes)

  afterUpdate(() => console.log(links))
</script>

<div class="header">
  <div class="logo-container"><img src="/assets/images/rocketswap.svg" alt="" /></div>
  <div class="links">
    {#each links as e}
      {#if e.$$name === "Pool" || e.$$name === "Swap"}
        <button class="nostyle"> 
          <a class:active={e === $active} href={e.$$href}> 
            {e.$$name} 
          </a> 
        </button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .active {
    border-bottom: 3px solid rgba(255, 255, 255);
    box-sizing: border-box;
  }

  .links {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1.4em;
    font-weight: 600;
    color: #fff;
    margin-right: 20px;
    box-sizing: border-box;
    /* padding-bottom: 6px */
  }

  .links a {
    color: #fff;
    margin-right: 40px;
    /* padding: 5px 15px; */
  }

  a:hover {
    text-decoration: none;
  }

  button:active,
  button:focus,
  button:hover {
    background: none;
  }
  .header {
    width: 100%;
    height: 95px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo-container {
    padding: 60px;
  }
</style>
