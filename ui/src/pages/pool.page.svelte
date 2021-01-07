<script lang="ts">
  import PoolMain from '../components/pool-main.svelte'

  $: pageTitle = 'RocketSwap Pools'

</script>


<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<PoolMain />
