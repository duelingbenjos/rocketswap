<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { routes, active } from 'svelte-hash-router'

	// Components
	import Socials from './misc/socials.svelte'
	import MainMenu from './main-menu.svelte'

	// Icons
	import RocketSwap from '../icons/rocketswap.svelte'
	import LightDark from '../icons/light-dark.svelte'
	import PoweredByLamden from './misc/powered-by-lamden.svelte'
	import Rocket from '../icons/rocket.svelte'
	import AntennaIcon from '../icons/antenna.svelte'

	// Services
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();

	// Misc
	import { mainMenuOpen, rswpPriceUSD, walletAddress, tauUSDPrice } from '../store'
	import { config } from '../config'
	import { stringToFixed } from '../utils'

	const { themeToggle, currentThemeName } = getContext('app')

	let links
	let menuItems = ["Swap", "Pools", "$RSWP", "Farm"]
	$: links = Object.values($routes)

	const handleLinkClick = () => mainMenuOpen.set(false)

	const logout = () => {
		walletService.logout()
	}
</script>


<style>
	.header {
		position: relative;
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

	.mobile-links{
		height: 100%;
	}

	.mobile-link {
		margin: 0.5rem auto;
	}
	.prices{
		margin: -0.2rem 0 0;
	}
	.powered-by{
		display: none;
	}
	.rocketswap-logo{
		margin-bottom: -0.5rem;
	}
	.rocket{
		margin: 0 auto 2rem;
		padding: 10px;
		width: 85px;
		height: 85px;
		border: 2px solid white;
		position: relative;
		border-radius: 99px;
		background: black;

		box-shadow: 0 0 30px 8px rgba(0, 0, 0, 0.3);
	    -webkit-box-shadow: 0 0 30px 8px rgba(0, 0, 0, 0.3);
	    -moz-box-shadow: 0 0 30px 8px rgba(0, 0, 0, 0.3);
	}
	.mobile-link > a {
		color: white;
	}
	.mobile-link > a.active {
		color: var(--color-primary);
		font-weight: 600;
	}
	.mobile-link > a.active:hover{
		color: var(--color-primary-light);
	}
	.mobile-link > a:hover{
		color: var(--color-secondary-light);
	}
	.socials{
		display: none;
		position: absolute;
		top: 0;
		right: 20px;
	}
	.logout{
		margin: 1rem auto 0;
		color: white;
	}
	/* When page width is greater than 320px */
    @media screen and (min-width: 320px) {
        .light-dark-button{
			display: none;
			
		}
    }

	/* When page width is greater than 430px (tablets) */
    @media screen and (min-width: 430px) {
		.header{
			padding: 40px 20px;
		}

    }
	/* When page width is greater than 475px (tablets) */
	 @media screen and (min-width: 475px) {
		.powered-by{
			display: block;
			position: relative;
    		top: 7px;
		}
    }

	
	/* When page width is greater than 650px (tablets) */
    @media screen and (min-width: 650px) {
		.socials{
			display: block;
		}
    }
	/* When page width is greater than 730px (tablets) */
    @media screen and (min-width: 730px) {
		.right-content{
			display: flex;
		}
    }
</style>


<div class="header flex-row">
	<div class="logo-container">
		<div class="flex-row">
			<div class="rocketswap-logo">
				<RocketSwap />
			</div>
			<div class="powered-by">
				<PoweredByLamden margin="0 0 0 8px"/>
			</div>
		</div>
		<span class="prices text-xsmall">
			<strong class="text-color-highlight">{config.currencySymbol}</strong>{`: $${stringToFixed($tauUSDPrice, 3)} USD | `}
			<strong class="text-color-highlight">{config.ammTokenSymbol}</strong>{`: $${stringToFixed($rswpPriceUSD, 3)} USD`}
		</span>
	</div>


	<div class="right-content flex-row flex-align-center flex-grow">
		<div class="links flex-row">
			{#each links as e}
				{#if menuItems.includes(e.$$name)}
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
			<div class="rocket">
				<Rocket 
					width="70px" 
					direction="up-right" 
					blastOff={true} 
					color="var(--color-primary)"
					styles="position: absolute; top: 17px; left: 13px;"
				/>
			</div>
			{#each links as e}
				{#if menuItems.includes(e.$$name)}
					<div class="mobile-link flex-row flex-center-center">
						<a  class=" text-xxlarge weight-400"
							class:active={e === $active} 
							href={e.$$href} on:click={handleLinkClick}> 
							{e.$$name} 
						</a> 
					</div>
				{/if}
			{/each}
			{#if $walletAddress}
				<button class="logout flex flex-center-center primary outline " on:click={logout} title="logout">
						<AntennaIcon width="20px" margin="0 8px 0 0" /> Logout
				</button>
			{/if}
			<div class="light-dark-button">
				<LightDark margin="1rem auto"/>
			</div>
			<div class="flex flex-grow flex-align-end">
        		<Socials width="30px" margin="2rem auto"  color="white" stroke="black" iconMargin="0 8px"/>
    		</div>
		</div>
	</MainMenu>
	<div class="flex-row socials">
		<Socials width="25px" margin="1rem 0" iconMargin="0 2px"/>
    </div>
</div>
