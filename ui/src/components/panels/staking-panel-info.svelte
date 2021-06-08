<script>
	import { fade } from 'svelte/transition'
	import { onMount, setContext } from 'svelte'

	// Icons
	import TokenLogo from '../../icons/token-logo.svelte'

	// Misc 
	import { formatAccountAddress, stringToFixed } from '../../utils' 

	export let toggleInfo
	export let stakingInfo
	export let yieldToken
	export let stakingToken
	export let stakingContractType

	const tauhqURL = "https://www.tauhq.com"


</script>

<style>
	.wrap {
		word-wrap: break-word;	
		line-height: 1.8;
	}
	p{
		margin: 0;
	}
	a {
		color: var(--color-secondary);
	}
	span{
		color: var(--text-primary-color-dim);
	}
	button{
		margin-top: 1rem;
	}
	.staking-detail{
		margin: 2rem 0 1rem;
	}
	.staking-input-output{
		margin: 0 0 1rem;
	}
	.dev-wallet{
		margin-top: 1rem;
	}
</style>

{#if stakingInfo}
	<div class="wrap text-small" in:fade={{}}>
		<p class="staking-detail">
			Stake
			<a href="{`${tauhqURL}/contracts/${stakingToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{`${stakingToken.token_symbol}${stakingInfo.meta.type === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
				<TokenLogo tokenMeta={stakingToken} {stakingContractType} width="18px" inline={true} margin="0 2px 0 2px" lpBottom={"0"} lpFontSize="6px"/> 
			</a>
			in this contract to get a share of {stringToFixed(stakingInfo.EmissionRatePerHour, 8)}
			<a href="{`${tauhqURL}/contracts/${yieldToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{yieldToken.token_symbol}
				<TokenLogo tokenMeta={yieldToken} inline={true} width="18px" margin="0 2px 0 0" lpBottom={"0"}/>  
			</a>
			emitted per hour.
		</p>

		<p class="text-small staking-input-output">
			{stringToFixed(stakingInfo.StakedBalance, 8)}
			<a href="{`${tauhqURL}/contracts/${stakingToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{`${stakingToken.token_symbol}${stakingInfo.meta.type === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
			</a>
			is currently staked in this contract and
			{stringToFixed(stakingInfo.WithdrawnBalance, 8)}
			<a href="{`${tauhqURL}/contracts/${yieldToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{yieldToken.token_symbol} 
			</a>
			has been withdrawn so far.
		</p>
		<p class="text-small">
			<span>Contract Name:</span>
			<a href="{`${tauhqURL}/contracts/${stakingInfo.contract_name}`}" target="_blank" rel="noopener noreferrer">{stakingInfo.contract_name}</a>
		</p>
		<p class="text-small">
			<span>Contract Type:</span> {stakingInfo.meta.type}
		</p>
		<p class="text-primary-dim text-small dev-wallet">
			This 
			<a href="{`${tauhqURL}/addresses/${stakingInfo.DevRewardWallet}`}" target="_blank" rel="noopener noreferrer">
				developer wallet
			</a> will earn {stringToFixed(stakingInfo.DevRewardPct, 2)}% of the tokens you withdraw.
		</p>

		<div class="flex-row flex-center-center">
			<button class="primary" on:click={toggleInfo}>CLOSE</button>
		</div>
	</div>
{/if}

