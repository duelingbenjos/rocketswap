<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte'
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    // Stores
    import { token_list_store, wallet_store } from '../../store'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    //Components
    import TokenSearch from './token-select-search.svelte'

    //Icons
    import Base64Svg from '../../icons/base64_svg.svelte'
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    
    //Misc
    import { stringToFixed  } from '../../utils'

    const dispatch = createEventDispatcher();
    const { getTokenList } = getContext('pageContext');

    export let selectedToken;

    let open = false;
    let api_tokens;

    $: filter = ""; 
    $: token_list = createTokenList(api_tokens, filter);
    $: selected_contract = selectedToken?.contract_name;

    const openTokenSelect = async () => {
        open = true;
        api_tokens = await getTokenList()
    }
    const closeTokenSelect = () => open = false;

    const selectToken = (token) => {
        selectedToken = token;
        dispatch('selected', token)
        open = false;
    }

    function createTokenList (tokenList, filter) {
        if (tokenList){
            if (filter !== "") {
                if (filter.startsWith("con_")){
                    tokenList = tokenList.filter(f => f.contract_name.includes(filter))
                }else{
                    tokenList = tokenList.filter(f => f.token_symbol.includes(filter) || f.token_symbol.includes(filter.toUpperCase()))
                }
                
            }

            return [...tokenList
                .map((token) => {
                    token.balance = walletService.wallet_state.tokens.balances[token.contract_name] || 0
                    return token
                })
                .sort((a, b) => {
                    return a.token_symbol.toLowerCase() < b.token_symbol.toLowerCase() ? -1 : a.token_symbol.toLowerCase() > b.token_symbol.toLowerCase() ? 1 : 0
                })
                .sort((a, b) => b.balance - a.balance)
            ]
        }
    }

    const handleSearch = (e) => {
        const { inputValue } = e.detail
        filter = inputValue
    }
</script>

<style>
    .select-wrapper {
        justify-content: space-between;
        width: 100%;
        align-items: center;
    }

    .select-icon {
        width: 10px;
        transform: rotate(180deg);
    }

    .button-item {
        width: 100%;
        display: flex;
        padding: 10px 10px 10px -30px;
        justify-content: space-around;
        /* padding: 10px; */
        align-items: center;
    }

    .button-item:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
    }

    .token-name-logo{
        align-items: center;
        justify-content: start;
    }
    .token-symbol {
        font-weight: 600;
    }

    .token-amount {
        font-weight: 400;
    }

    .token-container {
        width: 95%;
        display: flex;
        padding: 10px;
        justify-content: space-between;
    }

    .token-scroll {
        flex-grow: 1;
        overflow-y: scroll;
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .token-scroll::-webkit-scrollbar {
        display: none;
    }

    .token-list {
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .heading {
        display: flex;
        width: 100%;
        justify-content: space-between;
        padding-bottom: 30px;
    }

    hr {
        width: 100%;
        border-top: 0.5px solid #d9d9d90a;
    }

    img{
        margin: 0 5px;
    }
    .modal-style{
        width: 400px;
        height: 70%;
    }
    .input-token-label{
        margin: 0 3px 0 0;
    }

</style>
{#if !selectedToken}
    <button on:click={openTokenSelect} class="select-token flex-row" >
        <span class="input-token-label">Select Token</span> 
        <DirectionalChevron width="10px" direction="down" />
    </button>
{:else}
    <button class="select-token flex-row" on:click={openTokenSelect}>
    	{#if selectedToken}
			<Base64Svg string={selectedToken.logo_svg_base64} width="21px" margin="0 3px 0 0" />
		{/if}
        <span class="input-token-label">{selectedToken.token_symbol.toUpperCase()}</span> 
        <DirectionalChevron width="12px" direction="down" margin="0 0 -5px 0"/>
    </button>
{/if}

{#if open}
<div class="modal">
    <div class="modal-style flex-col text-large"
        in:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
        out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
        <div class="heading">
            <span class=""> Select a token </span> 
            <button class="nostyle" on:click={closeTokenSelect}> 
                <img src="assets/images/cancel.svg" alt="" />
            </button>
        </div>

        <TokenSearch on:search={handleSearch}/>
        <hr />
        <div class="token-scroll">
            <div class="token-list">
                {#if token_list}
                    {#if token_list.length > 0}
                        {#each token_list as token}
                            <div class="select-wrapper flex-row">
                                <button on:click={() => selectToken(token)} class="nostyle button-item">
                                    <div class="token-container">
                                        <div class="token-name-logo flex-row">
                                            <Base64Svg string={token.logo_svg_base64} width={'27px'} height={'27px'} />
                                            <span class="token-symbol"> {token.token_symbol.toUpperCase()} </span>
                                            {#if token.contract_name === selected_contract}
                                                <img class="select-icon" src="assets/images/token-select-arrow.svg" alt="" />
                                            {/if}
                                        </div>
                                        <span class="token-amount number"> {stringToFixed(token.balance || 0, 8)} </span>
                                    </div>
                                </button>
                            </div>
                        {/each}
                    {:else}
                        No Tokens Found
                    {/if}
                {:else}
                    Loading Tokens
                {/if}
            </div>
        </div>
    </div>
</div>
{/if}