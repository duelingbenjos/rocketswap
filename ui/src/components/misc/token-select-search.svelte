<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    const dispatch = createEventDispatcher();

    let inputValue;
    let timer;

    const handleInput = (e) => {
        if (!walletService) return;
        clearTimeout(timer)
        timer = setTimeout(getToken, 500);
    }

    const getToken = async () => {
        let tokenRes = await walletService.apiService.getToken(inputValue)
        dispatchEvent(tokenRes)
    }

    const dispatchEvent = (searchResult) => {
        dispatch('search', {inputValue, searchResult})
    }
</script>

<style>
    input{
        background-color: transparent;
        border: none;
        color: var(--text-primary);
    }
</style>

<input 
    placeholder="Token Name"
    bind:value={inputValue}
    on:input={handleInput}
/>
