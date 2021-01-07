<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { routes, active } from 'svelte-hash-router'

  //Icons
  import RocketSwap from '../icons/rocketswap.svelte'

  const { themeToggle, currentThemeName } = getContext('app')

  let links: any[]
  $: links = Object.values($routes)
  //$: toggleButtonText = $currentTheme === 'dark' ? 'light' : 'dark';


</script>


<style>
  .active {
    border-bottom: 3px solid var(--color-primary);
    box-sizing: border-box;
  }

  .links {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: var(--text-size-xlarge);
    font-weight: 600;
    margin-right: 20px;
    padding: 5px 12px;
    box-sizing: border-box;
    /* padding-bottom: 6px */
  }

  a {
    color: var(--header-primary-color);
    margin-right: 40px;
    padding: 0 5px;

  }

  a:hover {
    text-decoration: none;
    cursor: pointer;
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

  button.primary.small{
    color: var(--text-primary-color-inverted-color);
  }
</style>


<div class="header">
  <div class="logo-container">
    <RocketSwap />
  </div>
  <div class="links">
    {#each links as e}
      {#if e.$$name === "Pools" || e.$$name === "Swap"}
        <a class:active={e === $active} href={e.$$href}> 
          {e.$$name} 
        </a> 
      {/if}
    {/each}
    <button on:click={themeToggle} class="primary outline small">{$currentThemeName === 'dark' ? 'light' : 'dark'}</button>
  </div>

</div>
