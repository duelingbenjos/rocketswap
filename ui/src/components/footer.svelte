<script type="ts">
	import { onDestroy, onMount } from 'svelte'
	import { fade } from 'svelte/transition';
	import { active } from 'svelte-hash-router'

	// Misc
	import { walletBalance, rocketState, keystore, walletAddress, lwc_info } from '../store'
	import { config } from '../config'
	import { formatAccountAddress, stringToFixed, openNewTab } from '../utils'

	// Components
	import Rocket from '../icons/rocket.svelte'
	import Smoke from '../icons/smoke.svelte'
	import TrollBoxButton from './misc/troll-box-button.svelte'
	import ChooseWallet from './wallet-connections/choose-wallet.svelte'
	import KeystoreLogin from './wallet-connections/keystore-login.svelte'
	import Modal from './misc/modal.svelte'

	// Icons
	import AntennaIcon from '../icons/antenna.svelte'
	
	// Services
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();

	// Bindings
	let rocketElm;

	let smoke = true;
	let smokeList = [];
	let smokeTimer = null;

	let openConnectModal = false;

	rocketState.subscribe(val => {
		if (val == 2) setTimeout(rocketReset, 4000)
	})

	$: makeSmoke = $rocketState == 1 || $rocketState == 2 ? createSmoke() : stopSmoke();

    const createSmoke = () =>{
		const addSmoke = () => {
			if (rocketElm){
				const element = new Smoke({
					target: rocketElm,
					props: {
						scale: $rocketState == 1 ? Math.random() * (1 - 0.5) + 0.5 : 1,
						smokeTrail: $rocketState == 2,
						width: 30
					}
				})
			}
		}
        if (smokeTimer === null) {
			smokeTimer = setInterval(addSmoke, $rocketState == 2 ? 200 : 500)
			if ($rocketState == 2) setTimeout(stopSmoke, 4000)
		}
	}

    const stopSmoke = () => {
        clearInterval(smokeTimer);
        smokeTimer = null;
	}
	
	const rocketReset = () => {
		rocketState.set(3)
		setTimeout(() => rocketState.set(0), 500)
	}

	function refreshPage() {
		location.reload()
	}

	const openWalletUrl = () => openNewTab(`${config.blockExplorer}/addresses/${$walletAddress}`);

	const toggleModal = (e) => {
		if (openConnectModal) openConnectModal = false
		else openConnectModal = true
	}
	const logout = () => {
		walletService.logout()
	}
</script>

<style>
	.footer {
		position: fixed;
		display: flex;
		justify-content: flex-start;
		bottom: 0;
		padding: 5px 10px;
		background-color: var(--color-secondary);
		width: 100%;

	}
	.wallet-info {
		display:flex;
		flex-direction: row-reverse;
		align-items: center;
	}
	.balance {
		width: 100%;
    	text-align: left;
		margin-left: 8px;
		color: var(--color-white);
	}
	a.address{
		color: var(--text-grey-5);
	}
	.wallet-message {
		margin: 0 auto;
		text-decoration: underline;
		font-size: var(--text-size-large)
	}
	.wallet-message.locked{
		text-decoration: none;
	}
	.primary{
		border-radius: var(--border-radius);
		margin-left: 10px;
	}
	button.not-connected{
		align-self: center;
		padding: 7px 8px;
		margin-left: 0;
		margin-right: 8px;
		border-radius: 99px;
	}
	button.locked{
		padding: 8px 10px;;
	}
	.connected{
		background: var(--color-primary);
		padding: 3px 10px;
		color: var(--color-gray-5);
		margin-left: 0;
		border-radius: 99px;
	}
	.connected.locked{
		padding: 0;
	}
	.text-size {
		font-size: var(--text-size-large);
	}
	.rocket{
		position: absolute;
		z-index: 100;
		top: -59px;
		left: 0;
		transform: rotate(0deg);
	}
	.blast-off{
		transition: top 3s ease-in;
		top: -2000px;
	}
	.rocket-reset{
		display: none;
		transition: top 0s;
		top: -59px;
	}
	.connected > a{
		text-decoration: underline;
		margin-right: 8px;
	}


	/* When page width is greater than 430px (tablets) */
    @media screen and (min-width: 430px) {
		.footer{
			bottom: 20px;
			display: flex;
			align-items: center;
			background-color: transparent;
			z-index: 101;
			width: 100%;
			padding: 0 10px;
			color: var(--wallet-info-text);
		}
		.wallet-info {
			position: relative;
			min-height: 35px;
			min-width: 230px;
			padding: 0 0 0 12px;
			background-color: var(--color-secondary);
			border-radius: var(--border-radius);
			font-size: var(--text-size-large);
			flex-direction: row;
			justify-content: space-between;

			box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
			-webkit-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
			-moz-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
			
		}
		button.not-connected{
			margin: 0;
			border-radius: var(--border-radius);
		}
		.rocket{
			left: unset;
		}
		.text-size{
			font-size: unset;
		}
		.connected{
			padding: 2px 8px;
			margin-left: 10px;
			border-radius: var(--border-radius);
		}
		.balance {
			padding: 0;
			text-align: center;
		}
    }

    @media screen and (min-width: 2040px) {
        .footer{
			left: 50%;
    		transform: translate(-50%, 0px);
			max-width: 2040px;
		}
	}
	@media screen and (min-width: 3040px) {
        .footer{
			max-width: 3040px;
		}
    }
</style>


<div class="footer">
	<div class="wallet-info">
		{#if $walletAddress}
				<div bind:this={rocketElm} 
						in:fade="{{delay: 0, duration: 500}}"
						class="rocket" 
						class:blast-off={$rocketState == 2}
						class:rocket-reset={$rocketState == 3}>
					<Rocket 
						width="75px" 
						color="var(--success-color)" 
						direction="up" 
						shake={$rocketState == 1} 
						fire={$rocketState == 2}
						blastOff={$rocketState == 2}
					/>
				</div>
			
			{#if $lwc_info.locked}
				<span class="wallet-message locked text-size weight-600 text-color-white">Lamden Wallet Locked</span>
				<div class="flex-row flex-center-center primary connected locked text-size">
					<button class="flex flex-center-center primary not-connected medium" on:click={toggleModal} title="login">
						<AntennaIcon width="20px" margin="0 0 0 0" />
					</button>
				</div>
			{:else}
				<div class="balance text-size">{stringToFixed($walletBalance, 8)} {config.currencySymbol}</div>
				<div class="flex-row flex-center-center primary connected text-size">
					<button class="flex flex-center-center" on:click={logout} title="logout">
						<AntennaIcon width="20px" margin="0 8px 0 0" />
					</button>
					<a href="{`${config.blockExplorer}/addresses/${$walletAddress}`}" class="address" rel="noopener noreferrer" target="_blank" >
						{formatAccountAddress($walletAddress,4,2)}
					</a>
				</div>
			{/if}
		{:else}
			<button class="flex flex-align-center wallet-message text-size weight-600 text-color-white" on:click={toggleModal} title="login">
				Connect Wallet
			</button>
			<button class="flex flex-center-center primary not-connected medium" on:click={toggleModal} title="login">
				<AntennaIcon width="20px" margin="0 0 0 0" />
			</button>
		{/if}
	</div>
</div>

<Modal open={openConnectModal} {toggleModal} zIndex={110}>
	<div slot="main-centered">
		{#if walletService.keystore}
			<KeystoreLogin />
		{:else}
			<ChooseWallet />
		{/if}
	</div>
</Modal>

