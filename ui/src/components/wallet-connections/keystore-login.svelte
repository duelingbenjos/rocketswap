<script>
    import { getContext } from 'svelte'
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Services
	import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    //Icons 
    import CloseIcon from '../../icons/close.svelte'
    import PasswordIcon from '../../icons/password.svelte'
    import VisibleIcon from '../../icons/visible.svelte'
    import InvisibleIcon from '../../icons/invisible.svelte'
    import RocketSwapCircleLogoIcon from '../../icons/rocketswap-circle-logo.svelte'

    const { toggleModal } = getContext('modal_functions')

    let password = "";
    let errorMsg = "";
    let hidePassword = true;

    const handlePasswordSubmit = () => {
        try{
            walletService.decryptKeystore(password)
            setTimeout(walletService.conenctToKeystore, 1000)
            toggleModal()
        }catch (e){
            errorMsg = e.message
        }
    }
    const handleRemoveKeystoreData = () => {
        walletService.removeKeystoreData()
        toggleModal()
    }
</script>

<style>
    .modal-style{
        max-width: 450px;
        border-radius:  73px var(--border-radius) var(--border-radius) var(--border-radius);
        background: var(--modal-background-primary);
        background: var(--modal-wallet-setup-background);
    }
    button, input[type="submit"]{
        margin: 0 4px;
    }
    button.close-button{
        align-self: flex-start;
    }
    form{
        margin-right: -32px;
        margin-bottom: 1rem;
    }
    .buttons{
        margin: 1rem 0 0.5rem;
    }
</style>

<div class="modal-style modal-center flex-col flex-center-center"
    in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
    out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
    <div class="modal-heading text-xlarge">
        <div class="flex flex-center-center">
            <RocketSwapCircleLogoIcon margin="0 16px 0 0 "/>
            <span>Login with Keystore</span> 
        </div>
        
        <button class="nostyle close-button" on:click={toggleModal}> 
            <CloseIcon width="18px" />
        </button>
        
    </div>


    <form id="form-password" on:submit|preventDefault={handlePasswordSubmit}>
        <label for="password">Enter your Keystore Password </label>
        <div class="flex-row flex-center-center">
            {#if hidePassword}
                <input 
                    id="password"
                    class="primaryInput" 
                    type="password"
                    bind:value={password} 
                />
                <button 
                    title="Show Password"
                    class="flex-row flex-center-center" 
                    on:click={() => hidePassword = false}>
                        <VisibleIcon />
                </button>   
            {:else}
                <input 
                    id="password"
                    class="primaryInput" 
                    bind:value={password} 
                />
                <button 
                    title="Hide Password"
                    class="flex-row flex-center-center" 
                    on:click={() => hidePassword = true}>
                        <InvisibleIcon />
                </button>
            {/if}
        </div>
    </form>
    <span class="text-error">{errorMsg}</span>
    <div class="buttons flex-row flex-center-center flex-grow">
        <input type="submit" class="primary" value="Unlock" form="form-password" disabled={password === ""}/>
        <button class="primary outline" on:click={toggleModal}>Close</button>
    </div>
    <button class="text small" on:click={handleRemoveKeystoreData}>Remove Keystore Data</button>
</div>