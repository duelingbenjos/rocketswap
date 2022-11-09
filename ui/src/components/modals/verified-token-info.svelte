<script>
     // Components
    import Button from '../button.svelte';

    // Icons
    import IconVerifiedToken from '../../icons/verified_token.svelte'

    //Misc
    import { modal } from '../../store'

    function handleClose(){
        modal.set(null)
    }

</script>


<style>
    .modal-style{
        max-width: 450px;
        width: 100%;
        position: fixed;
        z-index: 100;
    }
    .icon{
        margin: 2rem auto;
        width: 25%;
    }
    span{
        margin: 1rem 0;
    }
    span > a {
        text-decoration: underline;
        color: var(--text-color-highlight);
    }
</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0 weight-600">Rocketswap Verified Tokens</p>
    </div>
    <div class="icon">
        <IconVerifiedToken width="100%" clickable={false}/>
    </div>
    
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <p class="text-primary-dim">
            Rocketswap is a decentralized exchange and can be used to swap any token that has a contract on Lamden.
        </p>
        <p class="flex flex-align-center">Tokens with the Verifed by Rocketswap badge can be considered safer than other contracts. </p>

        <span class="text-primary-dim">If you are unsure about any token then please ask about it in the <a href="https://t.me/rocketswap" rel="noopener noreferrer" target="_blank">Rocketswap Telegram</a> room.</span>
        
        <div class="modal-confirm-buttons flex-col">
            <Button style="primary" callback={handleClose} text="Close" />
        </div>
    </div>
</div>