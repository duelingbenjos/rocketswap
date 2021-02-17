<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { routes, active } from 'svelte-hash-router'

	//Icons
	import RocketSwap from '../icons/rocketswap.svelte'
	import LightDark from '../icons/light-dark.svelte'
	import PoweredByLamden from './misc/powered-by-lamden.svelte'

	const { themeToggle, currentThemeName } = getContext('app')

	let links: any[]
	$: links = Object.values($routes)
</script>


<style>
	.header {
		width: 100%;
		align-items: center;
		padding: 40px 20px;
		box-sizing: border-box;
	}

	.right-content{
		justify-content: flex-end;
	}

	.active {
		border-bottom: 3px solid var(--color-primary);
		box-sizing: border-box;
	}

	.links {
		align-items: center;
		font-size: var(--text-size-xlarge);
		font-weight: 600;
		box-sizing: border-box;
		z-index: 10;
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

	button.primary.small{
		color: var(--text-primary-color-inverted-color);
	}
</style>


<div class="header flex-row">
	<div class="logo-container">
		<RocketSwap />
		<PoweredByLamden margin="-5px 0 0 0"/>
	</div>
	<div class="right-content flex-row flex-align-center flex-grow">
		<div class="links flex-row">
		{#each links as e}
			{#if e.$$name === "Pools" || e.$$name === "Swap"}
				<a class:active={e === $active} href={e.$$href}> 
					{e.$$name} 
				</a> 
			{/if}
		{/each}
		</div>
		<LightDark />
	</div>
</div>
