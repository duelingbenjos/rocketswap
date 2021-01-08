<script lang="ts">
	import { getContext } from 'svelte'

	//Components
	import InputLpTokens from './misc/input-lp-tokens.svelte'
	import Buttons from './buttons.svelte'
	import Ratios from './misc/ratios.svelte'
	import TokensToReceive from './misc/tokens-to-recieve.svelte'

	const { pageStores, saveStoreValue } = getContext('pageContext')
	const { lpTokenPercentInput } = pageStores

	const handleLpTokensChange = (e) => saveStoreValue(lpTokenPercentInput, e.detail)
</script>


<div class="panel-container">
	<slot name="header"></slot>
	<InputLpTokens 
		label={'Amount'} 
		on:input={handleLpTokensChange}
	/>
	<TokensToReceive />
	<Ratios  showAll={true} />
	<slot name="footer"></slot>
</div>
