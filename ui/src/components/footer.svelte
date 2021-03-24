<script type="ts">
	import { onDestroy } from 'svelte'
	import { fade } from 'svelte/transition';
	import { active } from 'svelte-hash-router'

	// Misc
	import { walletBalance, rocketState, keystore, walletAddress } from '../store'
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
		bottom: 10px;

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
		min-width: 150px;
		padding: 0 10px;
		padding-bottom: 6px;
		background-color: var(--color-secondary);
		border-radius: var(--border-radius);
		font-size: var(--text-size-large);
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
		-webkit-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
		-moz-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
		
	}
	.balance {
		width: 100%;
    	text-align: left;
	}

	.wallet-message {
		margin: 0 auto;
	}
	.primary{
		border-radius: var(--border-radius);
		margin-left: 10px;
	}
	button.not-connected{
		align-self: center;
		padding: 7px 10px;
		margin-left: 0;
	}
	.connected{
		background: var(--color-primary);
		padding: 3px 10px;
		color: var(--color-gray-5);
		margin-left: 0;
	}
	.text-size {
		font-size: var(--text-size-small);
	}
	.rocket{
		position: absolute;
		z-index: 100;
		top: -59px;
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
        .wallet-info{
			min-width: 230px;
			padding-right: 10px;
			padding: 0 0 0 12px;
			flex-direction: row;
			align-items: center;
        }
		.text-size{
			font-size: unset;
		}
		.connected{
			padding: 2px 10px;
		}
		.balance {
			padding: 0 8px;
			text-align: center;
		}
    }

	/* When page width is greater than 430px (tablets) */
    @media screen and (min-width: 2040px) {
        .footer{
			left: 50%;
    		transform: translate(-50%, 0px);
			max-width: 2040px;
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
			<div class="balance text-size">{stringToFixed($walletBalance, 8)} {config.currencySymbol}</div>
			<div class="flex-row flex-center-center primary connected text-size">
				<button class="flex flex-center-center" on:click={logout} title="logout">
					<AntennaIcon width="20px" margin="0 8px 0 0" />
				</button>
				<a href="{`${config.blockExplorer}/addresses/${$walletAddress}`}" rel="noopener noreferrer" target="_blank" >
					{formatAccountAddress($walletAddress,4,2)}
				</a>
			</div>
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

