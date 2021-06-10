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
</style>

{#if stakingInfo}
	<div class="wrap" in:fade={{}}>
		<p class="staking-detail">
			Stake
			<a href="{`${tauhqURL}/contracts/${stakingToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{`${stakingToken.token_symbol}${stakingInfo.meta.type === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
				<TokenLogo tokenMeta={stakingToken} {stakingContractType} width="22px" inline={true} margin="0 3px 0 2px" lpBottom={"0"}/> 
			</a>
			in this contract and you will yield {stringToFixed(stakingInfo.EmissionRatePerHour, 8)}
			<a href="{`${tauhqURL}/contracts/${yieldToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{yieldToken.token_symbol}
				<TokenLogo tokenMeta={yieldToken} inline={true} width="22px" margin="0 3px 0 0" lpBottom={"0"}/>  
			</a>
			distributed proportionally to the 
			<a href="{`${tauhqURL}/contracts/${stakingToken.contract_name}`}" target="_blank" rel="noopener noreferrer">
				{`${stakingToken.token_symbol}${stakingInfo.meta.type === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
				<TokenLogo tokenMeta={stakingToken} {stakingContractType} inline={true} width="22px" margin="0 3px 0 0" lpBottom={"0"}/> 
			</a>
			in the staking pool.
		</p>
		<p>
			<span>Contract Name:</span>
			<a href="{`${tauhqURL}/contracts/${stakingInfo.contract_name}`}" target="_blank" rel="noopener noreferrer">{stakingInfo.contract_name}</a>
		</p>
		<p>
			<span>Contract Type:</span> {stakingInfo.meta.type}
		</p>
		<p>
			<span>Dev Reward Wallet: </span>
			<a href="{`${tauhqURL}/addresses/${stakingInfo.DevRewardWallet}`}" target="_blank" rel="noopener noreferrer">
				{formatAccountAddress(stakingInfo.DevRewardWallet, 8, 5)}
			</a>
		</p>
		<p class="text-primary-dim">
			The developer will earn {stringToFixed(stakingInfo.DevRewardPct, 2)}% of the tokens you withdraw.
		</p>

		<div class="flex-row flex-center-center">
			<button class="primary" on:click={toggleInfo}>CLOSE</button>
		</div>
	</div>
{/if}

