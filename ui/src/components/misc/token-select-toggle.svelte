<script>
    import { createEventDispatcher, getContext } from 'svelte'
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    // Stores
    import { token_list_store, tokenBalances, walletIsReady, verifiedTokens } from '../../store'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    //Components
    import TokenSearch from './token-select-search.svelte'
    import Modal from './modal.svelte'

    //Icons
    import TokenLogo from '../../icons/token-logo.svelte'
    import DirectionalChevron from '../../icons/directional-chevron.svelte'
    import CloseIcon from '../../icons/close.svelte'
    import SelectedArrow from '../../icons/selected-arrow.svelte'
    import IconVerified from '../../icons/verified_token.svelte'
    
    //Misc
    import { stringToFixed, toBigNumber, setTokenSelectFilter  } from '../../utils'
    import {tokenSelect_showUnverifed } from '../../store'

    const dispatch = createEventDispatcher();
    const { getTokenList, pageStores } = getContext('pageContext');
    const { selectedToken } = pageStores

    //export let selectedToken;

    let open = false;
    let api_tokens;

    $: filter = ""; 
    $: token_list = createTokenList(api_tokens, filter, $walletIsReady, $tokenBalances, $verifiedTokens, $tokenSelect_showUnverifed);
    $: selected_contract = $selectedToken?.contract_name;

    const openTokenSelect = async () => {
        open = true;
        api_tokens = await getTokenList()
    }
    const closeTokenSelect = () => open = false;

    const selectToken = (token) => {
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

            tokenList = tokenList.map(token => {
                    token.balance = addBalance(token)
                    token.isVerified = isVerified(token)
                    console.log(token)
                    return token
                })
                .sort((a, b) => b.balance.isGreaterThan(a.balance) ? 1 : -1)
            
            let hasBalance = tokenList.filter(f => f.balance.isGreaterThan("0"))
            let noBalance = tokenList
                .filter(f => f.balance.isEqualTo("0"))
                .sort((a, b) => {
                    return a.token_symbol.toLowerCase() < b.token_symbol.toLowerCase() ? -1 : a.token_symbol.toLowerCase() > b.token_symbol.toLowerCase() ? 1 : 0
                })
                .sort((a,b) => a.isVerified > b.isVerified ? -1 : 1)

            tokenList = [...hasBalance,  ...noBalance]

            if ($selectedToken){
                tokenList = tokenList.filter(f => f.contract_name !== $selectedToken.contract_name)
                tokenList.unshift({...$selectedToken, balance: addBalance($selectedToken), isVerified: isVerified($selectedToken)})
            }

            if (!$tokenSelect_showUnverifed) tokenList = tokenList.filter(f => f.isVerified)

            return tokenList
        }
    }

    function addBalance(token){
        if ($walletIsReady){
            return $tokenBalances[token.contract_name] || toBigNumber("0")
        }
        return toBigNumber("0")
    }

    function isVerified(token){
        return $verifiedTokens.includes(token.contract_name)
    }

    const handleSearch = (e) => {
        const { inputValue } = e.detail
        filter = inputValue
    }
    const handleShowUnverivied = (e) => {
        setTokenSelectFilter('show_unverified', e.target.checked)
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
    .input-token-label{
        margin: 1px 3px 0;
    }
    .input-token-label.has-token{
        font-size: 1.4em;
    }
    .input-token-label.no-token{
        font-size: var(--text-size-small);
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

    hr {
        width: 100%;
        border-top: 0.5px solid #d9d9d90a;
    }
    .modal-style{
        box-sizing: border-box;
        height: 100vh;
        max-height: calc(100vh * 0.7);
        max-width: 400px;
    }
    .chevron{
        position: relative;
        top: 2px;
        margin: 0 3px;
    }
    .chk-container{
        color: var(--text-primary-color-dimmer);
        font-size: 0.9em;
        margin: 0 0 1rem;
    }
    .chk-container:hover{
        filter: brightness(130%)
    }
    .show-unverified-checked{
        color: var(--text-color-highlight);
    }
    span.show-unverified-checked{
        border: 1px solid var(--text-color-highlight);
    }
    .chk-checkmark{
        margin-left: 0;
        border: 1px solid var(--text-primary-color-dimmer);
    }    

    /* When page width is greater than 430px and less than 650px (phones) */
    @media screen and (min-width: 430px) {
        .modal-style{
            width: 100vw;
            margin-top: 4rem;
        }
    }
</style>

{#if !$selectedToken}
    <button on:click={openTokenSelect} class="select-token flex-row" >
        <span class="input-token-label no-token">Select Token</span> 
        <div class="chevron">
            <DirectionalChevron width="9px" direction="down"/>
        </div>
    </button>
{:else}
    <button class="select-token flex-row" on:click={openTokenSelect}>
    	{#if $selectedToken}
			<TokenLogo tokenMeta={$selectedToken} width="21px" margin="0 3px" lpBottom={"0"}/>
		{/if}
        <span class="input-token-label has-token">{$selectedToken.token_symbol.toUpperCase()}</span> 
        <div class="chevron">
            <DirectionalChevron width="9px" direction="down" margin="0"/>
        </div>
        
    </button>
{/if}

<Modal {open} toggleModal={closeTokenSelect}>
    <div slot="main">
        <div class="modal-style flex-col text-large"
            in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
            out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
            <div class="modal-heading">
                <span> Select a token </span> 
                <button class="nostyle" on:click={closeTokenSelect}> 
                    <CloseIcon width="18px" />
                </button>
            </div>
            <label id="chk-showUnverified" class="flex-row chk-container flex-align-center" class:show-unverified-checked={$tokenSelect_showUnverifed} >
                <input type="checkbox" bind:checked={$tokenSelect_showUnverifed} on:change={handleShowUnverivied}>
                <span  class="chk-checkmark" class:show-unverified-checked={$tokenSelect_showUnverifed}></span>
                Show Unverified Tokens
            </label>
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
                                            <TokenLogo tokenMeta={token} width={'27px'} lpBottom={"-2px"}/>
                                            <span class="token-symbol"> {token.token_symbol.toUpperCase()} </span>
                                            {#if token.isVerified}
                                                <IconVerified width="20px" margin="0 0 0 8px" />
                                            {/if}
                                            {#if token.contract_name === selected_contract}
                                                <SelectedArrow width="10px" margin="0 8px" direction="left"/>
                                            {/if}
                                        </div>
                                        <span class="token-amount number number-span"> {stringToFixed(token.balance || 0, 8)} </span>
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
</Modal>
