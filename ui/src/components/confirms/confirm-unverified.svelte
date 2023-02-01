<script>
    import { getContext } from 'svelte';

    // Components
    import Button from '../button.svelte';

    // Icons
    import IconWarning from '../../icons/warning.svelte'
    import IconVerifiedToken from '../../icons/verified_token.svelte'

    // Props
    export let closeConfirm;

    const { pageStores } = getContext('pageContext');
    const { selectedToken } = pageStores

</script>


<style>
    .modal-style{
        max-width: 400px;
    }
    .modal-sub-box{
        width: 100vw;
        max-width: 380px;
    }
    a.text-large{
        display: block;
        margin: 1rem auto 2rem;
        text-decoration: underline;
    }
    .verified-icon{
        width: 30%;
        padding-right: 1em;
    }
    span{
        margin: 1rem 0;
    }
    span > a {
        text-decoration: underline;
        color: var(--text-color-highlight);
    }
    .verified-icon-row > p{
        margin: 0;
    }
    @media screen and (min-width: 430px) {
        .modal-style{
            width: 100vw;
            margin-top: 8rem;
        }
    }
</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0 text-warning">Unverified Token Contract</p>
        <IconWarning color={"var(--warning-color)"}/>
    </div>

    {#if $selectedToken}
        <a href="{`https://www.tauhq.com/contracts/${$selectedToken.contract_name}`}" 
        class="text-large text-center" rel="noopener noreferrer" target="_blank">
            {$selectedToken.contract_name}
        </a>
    {/if}

    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <p class="text-primary-dim">Rocketswap is a decentralized exchange and can be used to swap any token that has a contract on Lamden. This means that you could have followed links to potentially unsafe token contracts.</p>
        <div class="verified-icon-row flex flex-align-center">
            <div class="verified-icon">
                <IconVerifiedToken width="100%" clickable={false}/>
            </div>
            
            <p class="flex flex-align-center">Tokens with the Verifed by Rocketswap badge can be considered safer than other contracts. </p>
        </div>

        <span class="text-primary-dim">If you are still unsure about this contract ask about it in the <a href="https://t.me/rocketswap" rel="noopener noreferrer" target="_blank">Rocketswap Telegram</a> room.</span>
        
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" callback={closeConfirm} text="I UNDERSTAND" />
        </div>
    </div>
</div>