<script>
    import { getContext } from 'svelte'
	import { fly, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import LamdenWalletConnect from './lamden-wallet-connect.svelte'
    import KeystoreConnect from './keystore-connect.svelte'
    import Spinner from '../pulse-spinner.svelte'

    //Icons 
    import CloseIcon from '../../icons/close.svelte'
    import CircleCheck from '../../icons/circle-check.svelte'
    import UploadIcon from '../../icons/upload.svelte'
    import LamdenLogoIcon from '../../icons/lamden-logo.svelte'
    import RocketSwapCircleLogoIcon from '../../icons/rocketswap-circle-logo.svelte'

    //Misc
    import { lwc_info} from '../../store'
    import { walletDownloadURL } from '../../config'
    
    const { toggleModal } = getContext('modal_functions')

    let selectedOption = 0
    let screenWidth;

    const setSelectedOption = (selected) => selectedOption = selected
    const backToMain = () => selectedOption = 0

</script>

<style>
    .modal-style{
        align-items: flex-start;
        max-width: 650px;
        border-radius:  var(--border-radius);
        background: var(--modal-background-primary);
        background: var(--modal-wallet-setup-background);
        border: 1px solid var(--text-primary-color-dimmer);
    }
    button.primary{
        margin-right: 10px;
        padding: 6px 14px;
        width: 200px;
    }
    button.close-button{
        align-self: flex-start;
    }
    a{
        text-decoration: underline;
    }
    .wallet-button{
        display: flex;
        flex-direction: column;
    }
    .wallet-option{
        margin-top: 1rem;
    }

    .modal-heading{
        position: relative;
        margin-bottom: 2rem;
    }
    hr{
        margin-top: 2rem;
        margin-bottom: 2rem;
    }
    @media screen and (min-width: 430px) {
        .modal-style{
            border-radius:  73px var(--border-radius) var(--border-radius) var(--border-radius);
        }
        .wallet-button{
            display: flex;
            flex-direction: row;
        }
    }
</style>
<div class="modal-style modal-center flex-col"
    in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
    out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
    <div class="modal-heading text-xlarge">
        <div class="flex flex-center-center">
            <RocketSwapCircleLogoIcon margin="0 16px 0 0 " width={screenWidth > 430 ? "24px" : "18px"}/>
            <span>
                {#if selectedOption === 0} Choose a Login Option {/if}
                {#if selectedOption === 1} Lamden Wallet Login {/if}
                {#if selectedOption === 2} Keystore Login {/if}
            </span> 
        </div>
        
        <button class="nostyle close-button" on:click={toggleModal}> 
            <CloseIcon width="18px" />
        </button>
        
    </div>

    {#if selectedOption === 0}
        <div
            in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
                <div class="wallet-option">
                <div class="wallet-button">
                    <button class="primary flex-row flex-center-center" on:click={() => setSelectedOption(1)} disabled={!$lwc_info.installed || $lwc_info.locked}>
                        <LamdenLogoIcon width="30px" margin="0 8px 0 0"/>
                        Lamden Wallet
                    </button>
                    {#if $lwc_info.installed === null} 
                        <div class="text-small text-color--primary-dim">Checking for Wallet</div>
                    {:else}
                        {#if $lwc_info.installed === false}
                            <a  href="{walletDownloadURL}" 
                                rel="noopener noreferrer" target="_blank"
                                class="text-small text-color--primary-dim">
                                Not Installed
                            </a>
                        {:else}
                            {#if $lwc_info.locked }
                                <div class="text-small text-color--primary-dim">Locked</div>
                            {:else}
                                <div class="flex flex-align-center text-small text-color--primary-dim">
                                    Installed
                                    <CircleCheck width="20px" margin="0 0 0 4px"/>
                                </div>
                            {/if}
                        {/if}
                    {/if}
                </div>
                <p class="text-primary-dim text-small">
                    The Lamden Wallet is a Chrome broswer plugin used to securly store your Lamden Accounts. You can install it from the
                    <a href="{walletDownloadURL}" rel="noopener noreferrer" target="_blank"> Chrome Webstore</a>
                </p>
            </div>
            <hr>
            <div class="wallet-option">
                <button class="primary flex-row flex-center-center" on:click={() => setSelectedOption(2)}>
                    <UploadIcon width="30px" margin="0 8px 0 0" color="white"/>
                    Keystore File
                </button>
                <p class="text-primary-dim text-small">
                    A Lamden Keystore can be used to login to Rocketswap in situations where the Lamden Wallet is not supported.
                    A keystore can be created using the Backup feature of the 
                    <a href="{walletDownloadURL}" rel="noopener noreferrer" target="_blank"> Lamden Wallet</a>.
                </p>
            </div>
        </div>
    {/if}

    {#if selectedOption === 1}
        <LamdenWalletConnect {backToMain}/>
    {/if}

    {#if selectedOption === 2}
        <KeystoreConnect {backToMain}/>
    {/if}
</div>

<svelte:window bind:innerWidth={screenWidth}/>