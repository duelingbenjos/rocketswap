<script>
    import { getContext } from 'svelte'
    import { fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Icons
    import LamdenLogoFullIcon from '../../icons/lamden-logo-full.svelte'

	//Services
	import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    //Misc
    import { toggleLamdenWalletAutoConnect } from '../../utils'
    import { lamdenWalletAutoConnect } from '../../store'

    export let backToMain

    $: checked = $lamdenWalletAutoConnect ? true : false;

    const { toggleModal } = getContext('modal_functions')

    const connnectToWallet = () => {
        toggleModal()
        walletService.connectToWallet();
    }

    
</script>

<style>
    button{
        margin: 0 4px;
    }
    .flex-grow{
        width: 100%;
    }
    .buttons{
        margin: 2rem 0 1rem;
    }
</style>

<div class="flex-col flex-center-center flex-grow"
     in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
    <LamdenLogoFullIcon width="45%" margin="-1rem 0 1rem"/>
    <label class="flex-row chk-container text-body2" id="chk-all">
        Auto Connect to Lamden Wallet?
        <input  type="checkbox" bind:checked={checked} on:change={toggleLamdenWalletAutoConnect}>
        <span class="chk-checkmark"></span>
    </label>
    <div class="buttons flex-row flex-center-center flex-grow">
        <button class="primary" on:click={connnectToWallet}>Connect</button>
        <button class="primary outline" on:click={backToMain}>Back</button>
    </div>

</div>
