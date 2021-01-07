<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte'
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    // Stores
    import { token_list_store, tokenBalances, walletIsReady } from '../../store'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    //Components
    import TokenSearch from './token-select-search.svelte'

    //Icons
    import Base64Svg from '../../icons/base64_svg.svelte'
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    import CloseIcon from '../../icons/close.svelte'
    import SelectedArrow from '../../icons/selected-arrow.svelte'
    
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
            if ($walletIsReady){
                tokenList = [...tokenList
                    .map((token) => {
                        token.balance = $tokenBalances[token.contract_name] || 0
                        return token
                    })
                    .sort((a, b) => {
                        return a.token_symbol.toLowerCase() < b.token_symbol.toLowerCase() ? -1 : a.token_symbol.toLowerCase() > b.token_symbol.toLowerCase() ? 1 : 0
                    })
                    .sort((a, b) => b.balance - a.balance)
                ]
            }
            return tokenList
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

    .button-item {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 0.25rem 0;
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .heading {
        display: flex;
        width: 100%;
        justify-content: space-between;
        margin: 0 0 1rem;
    }

    hr {
        width: 100%;
        border-top: 0.5px solid #d9d9d90a;
    }
    .modal-style{
        width: 400px;
        height: 70%;
    }
    .chevron{
        position: relative;
        top: 2px;
        margin: 0 3px;
    }

</style>
{#if !selectedToken}
    <button on:click={openTokenSelect} class="select-token flex-row" >
        <span class="input-token-label text-small ">Select Token</span> 
        <DirectionalChevron width="10px" direction="down" />
    </button>
{:else}
    <button class="select-token flex-row" on:click={openTokenSelect}>
    	{#if selectedToken}
			<Base64Svg string={selectedToken.logo_svg_base64} width="21px" margin="0 3px" />
		{/if}
        <span class="input-token-label text-xlarge">{selectedToken.token_symbol.toUpperCase()}</span> 
        <div class="chevron">
            <DirectionalChevron width="12px" direction="down" margin="0"/>
        </div>
        
    </button>
{/if}

{#if open}
<div class="modal">
    <div class="modal-style flex-col text-large"
        in:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
        out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
        <div class="heading">
            <span> Select a token </span> 
            <button class="nostyle" on:click={closeTokenSelect}> 
                <CloseIcon width="18px" />
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
                                    <div class="token-name-logo flex-row">
                                        <Base64Svg string={token.logo_svg_base64} width={'27px'} height={'27px'} />
                                        <span class="token-symbol"> {token.token_symbol.toUpperCase()} </span>
                                        {#if token.contract_name === selected_contract}
                                            <SelectedArrow width="10px" margin="0 8px" direction="left"/>
                                        {/if}
                                    </div>
                                    <span class="token-amount number"> {stringToFixed(token.balance || 0, 8)} </span>
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