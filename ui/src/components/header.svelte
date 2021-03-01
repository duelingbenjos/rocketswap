<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { routes, active } from 'svelte-hash-router'

	// Icons
	import RocketSwap from '../icons/rocketswap.svelte'
	import LightDark from '../icons/light-dark.svelte'
	import PoweredByLamden from './misc/powered-by-lamden.svelte'
	import MainMenu from './main-menu.svelte'

	// Misc
	import { mainMenuOpen } from '../store'

	const { themeToggle, currentThemeName } = getContext('app')

	let links: any[]
	$: links = Object.values($routes)

	const handleLinkClick = () => mainMenuOpen.set(false)
</script>


<style>
	.header {
		width: 100%;
		align-items: center;
		padding: 20px;
		box-sizing: border-box;
		justify-content: space-between;
	}
	.logo-container{
		margin-right: 20px;
	}
	.right-content{
		display: none;
		justify-content: flex-end;
	}

	.links > .active {
		border-bottom: 3px solid var(--color-primary);
		box-sizing: border-box;
	}

	.mobile-links > .active {
		color: var(--color-primary);
	}

	.links {
		align-items: center;
		font-size: var(--text-size-xlarge);
		font-weight: 600;
		box-sizing: border-box;
		z-index: 10;
	}

	.links > a {
		color: var(--header-primary-color);
		margin-right: 40px;
		padding: 0 5px;

	}
	
	.light-dark-button{
		display: block;
	}

	a:hover {
		text-decoration: none;
		cursor: pointer;
	}

	.mobile-links > a {
		margin: 0.5rem auto;

	}

	button.primary.small{
		color: var(--text-primary-color-inverted-color);
	}

	
	/* When page width is greater than 320px */
    @media screen and (min-width: 320px) {
        .light-dark-button{
			display: none;
		}
    }

	/* When page width is greater than 430px (tablets) */
    @media screen and (min-width: 430px) {
        .wallet-info{
			min-width: 230px;
        }
		.header{
			padding: 40px 20px;
		}
    }
	/* When page width is greater than 650px (tablets) */
    @media screen and (min-width: 650px) {
        .right-content{
			display: flex;
		}
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
	<MainMenu>
		<div class="mobile-links flex-col" slot="links">
			{#each links as e}
				{#if e.$$name === "Pools" || e.$$name === "Swap"}
					<a  class="text-xxlarge text-color-white weight-600"
						class:active={e === $active} 
						href={e.$$href} on:click={handleLinkClick}> 
						{e.$$name} 
					</a> 
				{/if}
			{/each}
			<div class="light-dark-button">
				<LightDark margin="0 auto"/>
			</div>
		</div>
	</MainMenu>
</div>
