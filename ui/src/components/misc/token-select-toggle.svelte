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
        //api_tokens = await walletService.apiService.getTokenList(tokenSelectContext)
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
            console.log(tokenList)
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
    button.open-button {
        display: flex;
        justify-content: space-between;
        align-items: center;

        color: #fff;
        background-color: #3131d98f;

        border: none;
        border-radius: 10px;
        
        font-size: 0.8em;
        font-weight: 600;

        width: max-content;
        padding: 7px 10px;
    }

    .token-select {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;

        z-index: 100;

        display: flex;
        flex-direction: column;

        box-sizing: border-box;
 
        color: #d9d9d9;
        background-color: #312a43;

        font-size: 1.2em;
        font-weight: 200;
        overflow-x: hidden;

        min-height: 600px;
        height: 70%;
        width: 480px;

        margin: 0 auto;
        padding: 30px;

        border-radius: 30px;
        
        box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);

    }

    .select-wrapper {
        justify-content: space-between;
        width: 100%;
        align-items: center;
    }

    .select-icon {
        width: 10px;
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

    .token-logo{
        width: 27px;
        height: 27px;
    }

    .token-plug{
        width: 27px;
        height: 27px;
        margin: 0 5px;
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
        height: 100%;
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

    .select-heading {
        width: 100%;
        justify-content: space-between;
        padding-bottom: 15px;
    }
    .token-label{
        align-items: center;
    }

    hr {
        width: 100%;
        border-top: 0.5px solid #d9d9d90a;
    }

    img{
        margin: 0 5px;
    }
</style>
{#if !selectedToken}
    <button on:click={openTokenSelect} class="open-button flex-row" >
        Select Token
        <img src="assets/images/chevron-arrow-down.svg" height="7" alt="arrow-down" />
    </button>
{:else}
    <button class="token-label flex-row" on:click={openTokenSelect}>
        {selectedToken.token_symbol.toUpperCase()}
        <img src="assets/images/chevron-arrow-down.svg" height="7" alt="arrow-down" />
    </button>
{/if}

{#if open}
    <div class="token-select" 
         in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
         out:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
        <div class="heading">
            <span> Select a token </span> 
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
                                {#if token.contract_name === selected_contract}
                                    <img class="select-icon" src="assets/images/token-select-arrow.svg" alt="" />
                                {/if}
                                <button on:click={() => selectToken(token)} class="nostyle button-item">
                                    <div class="token-container">
                                        <div class="token-name-logo flex-row">
                                            {#if token.logo_svg_base64}
                                                <img class="token-logo" src="{`data:image/svg+xml;base64,${token.logo_svg_base64}`}" alt="token logo"/>
                                            {:else}
                                                <div class="token-plug"></div>
                                            {/if}
                                            <span class="token-symbol"> {token.token_symbol.toUpperCase()} </span>
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
{/if}