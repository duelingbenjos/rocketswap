<script>
    import { onMount, tick } from 'svelte'

    //Misc
    import { walletIsReady, accountName, bearerToken, trollboxMessages } from '../../store'
    import { config } from '../../config'

    //Icons
    import TrollIcon from '../../icons/troll.svelte'

    //Services
	import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance();
    import { ApiService } from '../../services/api.service'
    const apiService = ApiService.getInstance();

    //Bindings
    let msgBox;
    let name;
    let message;

    let boxOpen = false;
    let sending = false;
    let nameTaken = false;
    let userColors = {}

    $: colorCreator = createUserColors($trollboxMessages)
    $: loggedIn = $bearerToken

    trollboxMessages.subscribe(async () => {
        await tick();
        msgBox.scroll({ top: msgBox.scrollHeight, behavior: 'smooth' });
    })

    onMount(async () => {
        boxOpen = getBoxState();
        await tick()
        if (boxOpen){
            msgBox.scroll({ top: msgBox.scrollHeight + 10000, behavior: 'smooth' });
        }
    })

    const createUserColors = (list) => {
        list.map(message => {
            if (!userColors[message.sender]) userColors[message.sender] = Math.floor(Math.random()*16777215).toString(16)
        })
    }

    const saveBoxState = () => {
        localStorage.setItem("trollbox-state", boxOpen)
    }

    const getBoxState = () => {
        let lsState = localStorage.getItem("trollbox-state")
        if (lsState === null) return false;
        return JSON.parse(lsState)
        
    }

    const handleBoxToggle = () => {
        if (boxOpen) boxOpen = false
        else boxOpen = true
        saveBoxState()

    }

    const removeSpace = (e)  => {
        name = name.replace(/\s/g, "")
    }

    const handleCreateName = async () => {
        sending = true;
        nameTaken = await walletService.nameIsTaken(name)
        if (!nameTaken){
            await walletService.createAccountName(name, {success, error})
        }
    }

    const handleLogin = async () => {
        sending = true;
        await walletService.sendAuth({success, error})
    }

    const success = (res) => {
        sending = false
        loggedIn = true
    }

    const error = (errors) => {
        console.log(errors)
        sending = false
    }

    const handleSendMessage = async () => {
        if (!message) return
        let res = await apiService.sendMessage(message)
        console.log(res)
        message = ""
        if (!res) handleLogin()
    }

    const handleEnterKey = (e) => {
        if (e.which === 13)  handleSendMessage()
    }

</script>

<style>
    .box-wrapper{
        z-index: 102;
        position: fixed;
        bottom: 0;
        right: 48px;
        background: var(--modal-background-primary);
        width: 450px;
        height: 31px;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        border: 1px solid var(--text-primary-color-dim);
        transition: 1s height ease-in-out;
    }
    .half-opacity{
        opacity: 0.75;
    }
    .box-wrapper:hover{
        opacity: 1;
    }
    .box{
        position: relative;
        width: 100%;
        height: 100%;
    }
    button.open-close{
        position: absolute;
        background: transparent;
        margin: 0 50%;
        transform: translate(-50%, 0);
        z-index: 1;
        border-radius: 99px;
        padding: 10px;
        margin-top: -54px;
    }
    button.open-close:active{
        top: 0;
    }
    button.create-id{
        margin-left: 20px;
    }
    .box-header{
        text-align: center;    
    }
    .box-is-open{
        height: 300px;
    }
    .box-controls{
        padding: 20px;
    }
    .box-controls > span {
        min-width: fit-content;
    }
    .box-controls > input {
        width: 100%;
        margin-right: 10px;
    }
    .box-messages{
        box-sizing: border-box;
        margin: 0 20px;
        padding: 2px 10px;
        border: 1px solid var(--text-primary-color-dim);
        overflow-y: scroll;
    }
    .message{
        line-height: 1.3;
        margin-bottom: 6px;
    }

</style>

<div class="box-wrapper" class:box-is-open={boxOpen} class:half-opacity={!boxOpen}>
    <div class="box flex-col">
        <button class="open-close" on:click={handleBoxToggle}>
            <TrollIcon width="45px" />
        </button>
        <div class="box-header text-large">
            Troll Box
        </div>
        <div bind:this={msgBox} class="box-messages flex-grow">
            {#each $trollboxMessages as message}
                <div class="message" style={`color: #${userColors[message.sender]}`}>
                    <strong style={`color: #${userColors[message.sender]}`}>{`${message.sender}: `}</strong>
                    {`${message.message}`}
                </div>
            {/each}
        </div>
        <div class="box-controls flex-row flex-align-center">
            {#if $walletIsReady && $accountName && !loggedIn}
                <button class="primary" disabled={!$walletIsReady} on:click={handleLogin}>login as {$accountName}</button>
            {/if}
            {#if $walletIsReady && !$accountName}
                <input 
                    type="text" 
                    bind:value={name} 
                    class="input-username" 
                    on:input={removeSpace}
                    maxlength="20" 
                    placeholder="Choose a Rocket ID"
                />
                <span>Costs 5 {config.currencySymbol}</span>
                <button class="create-id primary" disabled={name === ""} on:click={handleCreateName}>Create</button>
            {/if}
            {#if !$walletIsReady}
                <span>Connect wallet to login</span>
            {/if}

            {#if loggedIn}
                <input 
                    type="text" 
                    bind:value={message} 
                    on:keydown={handleEnterKey}
                    class="input-message" 
                    maxlength="256" 
                    placeholder="Enter Message"
                />
                <button class="send-message primary" disabled={name === ""} on:click={handleSendMessage}>Send</button>
            {/if}

        </div>
    </div>
</div>