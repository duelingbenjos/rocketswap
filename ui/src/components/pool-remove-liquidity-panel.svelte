<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Components
	import InputLpTokens from './misc/input-lp-tokens.svelte'
	import Buttons from './buttons.svelte'
	import Ratios from './misc/ratios.svelte'
	import TokensToReceive from './misc/tokens-to-recieve.svelte'

	//Props
	export let pageState;

	const dispatch = createEventDispatcher();

	let state = { };

	afterUpdate(() => {
		state.selectedToken = pageState.selectedToken
	})

	const handleLpTokensChange = (e) => {
		state = Object.assign(state, {lpTokenPercentInput: e.detail})
		dispatch('infoUpdate', state)
	}
</script>


<div class="panel-container">
	<slot name="header"></slot>
	<InputLpTokens 
		label={'Amount'} 
		on:input={handleLpTokensChange}
	/>
	<TokensToReceive {...pageState} {...state}/>
	<Ratios {pageState} showAll={true} />
	<slot name="footer"></slot>
</div>
