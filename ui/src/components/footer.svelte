<script type="ts">
	import { onDestroy } from 'svelte'
	import { fade } from 'svelte/transition';

	//Misc
	import { lwc_info, walletBalance, rocketState } from '../store'
	import { config } from '../config'
	import { formatAccountAddress, stringToFixed } from '../utils'

	//Components
	import Spinner from './pulse-spinner.svelte'
	import Rocket from '../icons/rocket.svelte'
    import Smoke from '../icons/smoke.svelte'

	//Services
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();

	//Bindings
	let rocketElm;

	let smoke = true;
	let smokeList = [];
	let smokeTimer = null;

	rocketState.subscribe(val => {
		if (val == 2) setTimeout(rocketReset, 6000)
	})

	$: makeSmoke = $rocketState == 1 || $rocketState == 2 ? createSmoke() : stopSmoke();

    const createSmoke = () =>{
		const addSmoke = () => {
			if (rocketElm){
				const element = new Smoke({
					target: rocketElm,
					props: {
						opacity: $rocketState == 1 ? Math.random() * (0.6 - 0.4) + 0.4 : 0.5,
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
		setTimeout(() => rocketState.set(0), 1000)
	}

	function refreshPage() {
		location.reload()
	}

	const connnectToWallet = () => walletService.connectToWallet();

	const openWalletUrl = () => window.open(`${config.blockExplorer}/addresses/${$lwc_info.walletAddress}`);
</script>

<style>
	.footer {
		background-color: transparent;
		z-index: 101;
		width: 100%;
		display: flex;
		align-items: center;
		position: fixed;
		bottom: 15px;
		color: var(--wallet-info-text);
	}
	.wallet-info {
		position: relative;
		background-color: var(--color-secondary);
		margin-left: 48px;
		border-radius: var(--border-radius);
		font-size: var(--text-size-large);
		padding-left: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-width: 230px;
	}
	.balance {
		padding-left: 8px;
		width: 100%;
    	text-align: center;
	}

	.wallet-message {
		padding-right: 16px;
		margin: 0 auto;
	}
	button.primary{
		border-radius: var(--border-radius);
		margin-left: 10px;
	}
	.rocket{
		position: absolute;
		z-index: 100;
		top: -59px;
		transform: rotate(0deg);
		transition: top 3s ease-in;
	}
	.blast-off{
		top: -1000px;
	}
	.rocket-reset{
		display: none;
		top: -59px;
	}
</style>


<div class="footer">
	<div class="wallet-info">
		{#if $lwc_info.installed === null} 
			<Spinner size={29} color="#FFFFFF" unit="px" padding="10px"/>
		{:else}
			{#if $lwc_info.installed === false}
				<button class="wallet-message" on:click={refreshPage}>Wallet not Installed</button>
			{:else}
				{#if $lwc_info.locked }
					<div class="wallet-message">Wallet is Locked</div>
				{:else}
					{#if $lwc_info.approved}
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
								smokeTrail={$rocketState == 2}
								blastOff={$rocketState == 2}
							/>
						</div>
						<div class="balance">{stringToFixed($walletBalance, 8)} {config.currencySymbol}</div>
						<button class="primary medium" on:click={openWalletUrl}>{formatAccountAddress($lwc_info.walletAddress,4,2)}</button>
					{:else}
						<button class="wallet-message" on:click={connnectToWallet}>Connect to Lamden Wallet</button>
					{/if}
				{/if}
			{/if}
		{/if}
	</div>
</div>

