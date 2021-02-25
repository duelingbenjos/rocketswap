<script>
    import { getContext } from 'svelte'
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import Lamden from 'lamden-js'

    //Services
	import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();

    // Icons
    import UploadIcon from '../../icons/upload.svelte'
    import UserIcon from '../../icons/user.svelte'
    import UserSuccessIcon from '../../icons/user-success.svelte'
    import PasswordIcon from '../../icons/password.svelte'
    import VisibleIcon from '../../icons/visible.svelte'
    import InvisibleIcon from '../../icons/invisible.svelte'
    import DirectionalChevronIcon from '../../icons/directional-chevron.svelte'
    

    // Misc
    import { keystore } from '../../store'
    import { formatAccountAddress, setLSValue } from '../../utils'

    // DOM Elements
    let selectElm;
    

    const { toggleModal } = getContext('modal_functions')

    export let backToMain;

    let errorMsg = "";
    let password = "";
    let hidePassword = true;
    let keystoreStep = 1;
    let selectedWallet;
    let saveData;
    let ks;


    const exit = () => {
        keystore.set(null)
        backToMain()
    }

    const backToStep1 = () => {
        resetAll()
        keystoreStep = 1
    }

    const resetAll = () => {
        keystore.set(null)
        password = undefined
        errorMsg = ""
    }

    const login = () => {
        let accountToKeep = ks.wallets[selectedWallet].vk
        let i = 0
        while (ks.wallets.length > 1) {
            if (ks.wallets[i].vk === accountToKeep) i = i + 1
            ks.deleteKey(i)
        }
        if (saveData) setLSValue("encrypted_keystore_data", ks.createKeystore(password))
        setLSValue("lamden_wallet_autoconnect", false)
        walletService.addKeystoreDecrypted(ks)
        walletService.conenctToKeystore()
        toggleModal()
    }

    const openPicker = () => {
        let element = document.getElementById('filePicker');
        element.click();
    }

    const handleFileEvent = (ev) => {
        errorMsg = ""
        let file;
        ev.preventDefault();

        if (ev.target.files){
            file = ev.target.files[0];
        } else if (ev.dataTransfer.items) {
            ev.dataTransfer.items[0].kind === 'file' ? file = ev.dataTransfer.items[0].getAsFile() : null;
        } else if (ev.dataTransfer.files) {
            ev.dataTransfer.files[0].kind === 'file' ? file = ev.dataTransfer.files[0].getAsFile() : null;
        }
        if (file) {
            if (file.name.includes(".keystore")){
                setKeystore(file)
            }
        }
    }

    const setKeystore = (file) => {
        validateKeyStoreFile(file).then(keystoreData => {
            try{
                ks = new Lamden.Keystore({keystoreData})
                keystoreStep = 2
            }catch (e){
                errorMsg = "Not a valid Lamden keystore file"
            }
        })
        .catch(err => errorMsg = err)
    }

    const validateKeyStoreFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();      
            reader.onload = async function (e) {
                let output = e.target.result;
                let keystoreObj = {};
                
                try{
                    keystoreObj = JSON.parse(JSON.parse(output).data);
                } catch (e) {
                    reject("Not a valid Lamden keystore file")
                }

                if (!keystoreObj.ct || !keystoreObj.iv || !keystoreObj.s){
                    reject("Not a valid Lamden keystore file")
                }
                resolve(output)
            };
            reader.readAsText(file);
        })
    }

    const handlePasswordSubmit = () => {
        try{
            ks.decryptKeystore(password) 
            if (ks.wallets.length > 0) {
                if (ks.wallets.length > 1) keystoreStep = 3
                else {
                    selectedWallet = 0;
                    keystoreStep = 4
                }
            }else{
                throw new Error("Keystore is empty.")
            }
        }catch (e){
            errorMsg = e.message
        }
    }

    const createAccountName = (wallet) => {
        if (wallet.nickname) {
            return `${wallet.nickname}: ${formatAccountAddress(wallet.vk, 4, 4)}`
        }
        return formatAccountAddress(wallet.vk, 8, 4)
    }
</script>

<style>
    input[type="file"]{
        display: none;
    }
    .outline{
        padding: 2px 10px;
    }
    button, input[type="submit"]{
        margin: 0 4px;
    }
    .flex-grow{
        width: 100%;
    }
    p{
        margin: 0;
    }
    form{
        margin-right: -32px;
    }
    .buttons{
        margin: 2rem 0 1rem;
    }
    label[for="password"]{
        margin-bottom: 0.25rem;
    }

    #chk-all{
        margin-top: 1rem;
    }
    .dropdown{
        position: relative;
    }
    .dropdown > div {
        position: absolute;
        top: 8px;
        right: 10px;
    }
    select{
        width: 100%;
    }

</style>

{#if keystoreStep === 1}
    <div class="flex-col flex-center-center flex-grow"
        in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
        <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>
        <UploadIcon width="15%" margin="0 auto" />
        <p class="text-large text-primary-dim">Select a Keystore File</p>
        <span class="text-error">{errorMsg}</span>
        <div class="buttons flex-row flex-center-center flex-grow">
            <button class="primary" on:click={openPicker}>Select File</button>
            <button class="primary outline" on:click={backToMain}>Back</button>
        </div>
    </div>
{/if}

{#if keystoreStep === 2}
    <div class="flex-col flex-center-center flex-grow" 
         in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
        <PasswordIcon width="15%" margin="-1rem 0 1rem" />
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
                            <VisibleIcon margin="0 0 0 4px"/>
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
                            <InvisibleIcon margin="0 0 0 4px"/>
                    </button>
                {/if}
            </div>
        </form>
        <span class="text-error">{errorMsg}</span>
        <div class="buttons flex-row flex-center-center flex-grow">
            <input type="submit" class="primary" value="Unlock" form="form-password" disabled={password === ""}/>
            <button class="primary outline" on:click={backToStep1}>Back</button>
        </div>
    </div>
{/if}
    
{#if keystoreStep === 3}
    <div class="flex-col flex-center-center flex-grow"
        in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
        <UserIcon width="15%" margin="-1rem 0 1rem" />
        <p class="text-large text-primary-dim">Select an Account</p>
        <div class="dropdown">
            <select bind:value={selectedWallet} on:blur={() => console.log(selectedWallet)} bind:this={selectElm}>
                {#each ks.wallets as wallet, index}
                    <option value={index}>
                        {createAccountName(wallet)}
                    </option>
                {/each}

            </select>
            <div on:click={() => selectElm.setAttribute('size', ks.wallets.length)}>
                    <DirectionalChevronIcon width="10px" direction="down" color="var(text-color-primary)"/>
            </div>
        </div>

        
        <div class="buttons flex-row flex-center-center flex-grow">
            <button class="primary" on:click={() => keystoreStep = 4}>Select Accout</button>
            <button class="primary outline" on:click={backToStep1}>Back</button>
        </div>
    </div>
{/if}

{#if keystoreStep === 4}
    <div class="flex-col flex-center-center flex-grow"
        in:fade="{{delay: 0, duration: 300, opacity: 0.5, easing: quintOut}}">
        <UserSuccessIcon width="15%" margin="-1rem 0 0" />
        <p class="text-large text-primary-dim">
            {#if ks.wallets[selectedWallet].nickname}
                {`${ks.wallets[selectedWallet].nickname}: ${formatAccountAddress(ks.wallets[selectedWallet].vk, 8,4)}`}
            {:else}
                Account: {formatAccountAddress(ks.wallets[selectedWallet].vk, 8,4)}
            {/if}
        </p>
        <label class="flex-row chk-container text-body2" id="chk-all">
            Encrypt this account in my browser
            <input  type="checkbox" bind:checked={saveData}>
            <span  class="chk-checkmark"></span>
        </label>
        <p class="text-small text-primary-dimmer">** Your Login password will be the same **</p>
        
        <div class="buttons flex-row flex-center-center flex-grow">
            <button class="primary" on:click={login}>Login</button>
            <button class="primary outline" on:click={backToMain}>Back</button>
        </div>
    </div>
{/if}