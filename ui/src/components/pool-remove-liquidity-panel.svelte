<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Components
	import InputLpTokens from './misc/input-lp-tokens.svelte'
	import PoolButtons from './pool-buttons.svelte'
	import Prices from './misc/prices.svelte'
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

<style>
  .panel-container {
    margin: 0 auto;
    margin-top: 15px;
    padding: 30px;
    background-color: #875dd6;
    color: #fff;
    width: 380px;
    border-radius: 32px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 15px;
  }


  @media screen and (max-width: 800px) {
    .panel-container {
      margin: 0;
      height: 100%;
      width: 100%;
      border-radius: 0px;
    }

  }
</style>

<div class="panel-container">
	<slot name="header"></slot>
	<InputLpTokens 
		label={'Amount'} 
		on:input={handleLpTokensChange}
	/>
	<TokensToReceive {...pageState} {...state}/>
	<Prices {pageState} />
	<slot name="footer"></slot>
</div>
