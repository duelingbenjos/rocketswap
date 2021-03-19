<script>
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    // Misc
    import { toBigNumber, setSlippageTolerance, stringToFixed} from '../../utils' 
    import { slippageTolerance } from '../../store'

    //Icons 
    import CloseIcon from '../../icons/close.svelte'
    import RocketSwapCircleLogoIcon from '../../icons/rocketswap-circle-logo.svelte'

    export let toggleModal;

    let inputElm;
    let inputVal;
    
    $: hasSlippageInput = inputVal ? true : false;

    const handleSetSlippageTolerance = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			setSlippageTolerance(toBigNumber(validateValue))
		}
    }

    const handleClick_slippageTolerance = (value) => {
        inputElm.value = ""
        inputVal = ""
        setSlippageTolerance(toBigNumber(value))
    }
</script>

<style>
    .modal-style{
        max-width: 450px;
        border-radius:  73px var(--border-radius) var(--border-radius) var(--border-radius);
        background: var(--modal-background-primary);
        background: var(--modal-wallet-setup-background);
        border: 1px solid var(--text-primary-color-dimmer);
    }
    .input-small{
        width: 73px;
        padding: 5px 20px 5px 10px;
        margin-top: 1px;
    }
    .slippage-input{
        position: relative;
    }
    .slippage-input::after{
        content:'%';
        position:absolute;
        right: 10px;
        top: 5px;
        width: fit-content;
        height: fit-content;
        color: var(--text-primary-color-dim);
    }
    button.small{
        font-size: var(--text-size-small);
        padding: 3px 9px;
    }
    .buttons{
        margin: 2rem 0 0 0;
    }
    .percent{
        position: relative;
        top: 1px;
    }
    .flex-center-spacebetween{
        margin-top: 2rem;
        width: 100%;
        max-width: 314px;
    }
    p{
        margin: 0 0 0 0;
    }
</style>

<div class="modal-style modal-center flex-col flex-center-center"
    in:fly="{{delay: 0, duration: 500, x: 0, y: 20, opacity: 0.5, easing: quintOut}}"
    out:fly="{{delay: 0, duration: 200, x: 0, y: 20, opacity: 0.0, easing: quintOut}}">
    <div class="modal-heading text-xlarge">
        <div class="flex flex-center-center">
            <RocketSwapCircleLogoIcon margin="0 16px 0 0 "/>
            <span>Slippage Tolerance</span> 
        </div>
        
        <button class="nostyle close-button flex" on:click={toggleModal}> 
            <CloseIcon width="18px" />
        </button>
        
    </div>
    <p class="text-size-small">
        Since the swap will untimatly take place in the smart contract there could be changes in the price after your transaction is submitted.
    </p>
    <ul class="text-size-small text-primary-dim">
        <li>
            Setting a low slippage tolerance will cause the transactoin to fail if the price moves unfavorabley in the wrong direction.
        </li>
        <li>
            Set a high slippage tolerance if you're willing to accept large unfavorable price movements.
        </li>
    </ul>
    <div class="flex-row flex-center-spacebetween">
        <button 
            class="primary small" 
            disabled={$slippageTolerance.isEqualTo(0.1)  && !hasSlippageInput} 
            on:click={() => handleClick_slippageTolerance("0.1")}>
            <span class="number number-span">0.1</span>%
        </button>
        <button 
            class="primary small" 
            disabled={$slippageTolerance.isEqualTo(0.5)  && !hasSlippageInput} 
            on:click={() => handleClick_slippageTolerance("0.5")}>
            <span class="number number-span">0.5</span>%
        </button>
        <button 
            class="primary small" 
            disabled={$slippageTolerance.isEqualTo(1) && !hasSlippageInput} 
            on:click={() => handleClick_slippageTolerance("1.0")}>
            <span class="number number-span">1.0</span>%
        </button>
        <div class="slippage-input">
            <input 
                class="number primaryInput input-small number-span"
                placeholder="1.00"
                bind:this={inputElm}
                bind:value={inputVal}
                on:input={handleSetSlippageTolerance}
            />
        </div>
    </div>
    <div class="buttons flex-row flex-center-center flex-grow">
        <button class="primary outline" on:click={toggleModal}>Accept {stringToFixed($slippageTolerance,2)}<span class="percent">%</span></button>
    </div>
</div>