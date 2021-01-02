<script lang="ts">
	import { createEventDispatcher, afterUpdate, getContext } from 'svelte'

	//Services
	import { ApiService } from '../services/api.service'
	const apiService = ApiService.getInstance();

	//Router
	import { active } from 'svelte-hash-router'
	  
	//Stores
	import { wallet_store } from '../store'

	//Components
	import InputLpTokens from './misc/input-lp-tokens.svelte'
	import PoolButtons from './pool-buttons.svelte'
	import Prices from './misc/prices.svelte'
	import TokensToReceive from './misc/tokens-to-recieve.svelte'

	//Misc
	import { quoteCalculator, toBigNumber } from '../utils'

	//Props
	export let pageState;

	$: quoteCalc = quoteCalculator(pageState?.tokenLP);
	$: wallet_store_changes = setLpBalances($wallet_store, pageState)

	const dispatch = createEventDispatcher();

	let state = { 
		lpTokenAmount: toBigNumber("0.0")
	};

	afterUpdate(() => {
		state.selectedToken = pageState.selectedToken
	})

	function handleLpTokensChange(e){
		if (state?.lp_balances && pageState?.selectedToken){
			const { lp_balances } = state;
			const { selectedToken } = pageState;
			let lpTokenPercent = e.detail / 100;
			let lpBalance = lp_balances[selectedToken.contract_name]
			state = Object.assign(state, { 
				lpTokenAmount: lpBalance.multipliedBy(lpTokenPercent),
				lpBalance
			})
			dispatchEvent()
		}
		
	}

	const setLpBalances = async () => {
        if (!$wallet_store.init && !state.lp_balances){
            let vk = $wallet_store?.wallets[0];
            if (vk){
				let balancesRes = await apiService.getUserLpBalance(vk)
                if (balancesRes) state = Object.assign(state, {lp_balances: balancesRes.points})
            }
        }
    }

	const dispatchEvent = () => dispatch('infoUpdate', state)
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
		{...state}
	/>
	<TokensToReceive {...pageState} {...state}/>
	<Prices {pageState} />
	<slot name="footer"></slot>
</div>
