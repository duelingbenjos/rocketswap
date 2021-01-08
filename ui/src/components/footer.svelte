<script type="ts">
	import { onDestroy } from 'svelte'
	import type { WalletType, WalletInitType, WalletErrorType } from '../types/wallet.types'
	import { lwc_info, walletBalance } from '../store'
	import { config } from '../config'
	import { formatAccountAddress, stringToFixed } from '../utils'
	import { isWalletConnected, isWalletError, isWalletInit } from '../services/wallet.service'

	//Components
	import Spinner from './pulse-spinner.svelte'

	//Services
	import { WalletService } from '../services/wallet.service'
	const walletService = WalletService.getInstance();


	function refreshPage() {
		location.reload()
	}

	const connnectToWallet = () => walletService.connectToWallet();

	const openWalletUrl = () => window.open(`${config.blockExplorer}/addresses/${$lwc_info.walletAddress}`);
</script>

<div class="container">
	<div class="wallet-info">
		{#if typeof $lwc_info.installed === 'undefined'} 
			<Spinner size={29} color="#FFFFFF" unit="px" padding="10px"/>
		{:else}
			{#if !$lwc_info.installed}
				<button class="wallet-message" on:click={refreshPage}>Wallet not Installed</button>
			{:else}
				{#if $lwc_info.locked }
					<div class="wallet-message">Wallet is Locked</div>
				{:else}
					{#if $lwc_info.approved}
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

<style>
	.container {
		background-color: transparent;
		width: 100%;
		display: flex;
		align-items: center;
		position: fixed;
		bottom: 15px;
		color: var(--wallet-info-text);
	}
	.wallet-info {
		background-color: var(--color-secondary);
		margin-left: 48px;
		border-radius: var(--border-radius);
		font-size: var(--text-size-large);
		padding-left: 12px;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 230px;
	}
	.wallet-button {
		display: flex;
		padding-right: 16px;
		padding-top: 12px;
		height: 100%;
	}
	.balance {
		padding-left: 8px;
	}

	.wallet-message {
		padding-right: 16px;
	}
	.address {
		margin: 3px 3px 0px 32px;
		padding: 5px 16px 4px 16px;
		height: 33px;
		background-color: var(--color-gray-2);
		border-radius: var(--border-radius);
		align-self: stretch;
		display: flex;
		align-items: center;
		font-weight: 200;
	}


	button.primary{
		border-radius: var(--border-radius);
		margin-left: 10px;
	}
</style>
