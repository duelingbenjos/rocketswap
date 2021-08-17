<script>
    import { createEventDispatcher } from 'svelte'

    // MISC
    import { stringToFixed, toBigNumber, determinePrecision } from '../../utils.js'

    const dispatch = createEventDispatcher();

    // DOM ELEMENT BINDINGS
    let inputElm;

    export let title = ""
    export let placeholder = "";
    export let styles = "";
    export let margin = "unset";
    export let startingValue = 0;

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = toBigNumber(e.target.value)
			if (determinePrecision(value) > 8){
				value = toBigNumber(stringToFixed(value, 8))
				inputElm.value = stringToFixed(value, 8)
			}
			dispatchEvent(value)
		}
    }
    
    const dispatchEvent = (value) => dispatch('input', value)
</script>

<style>
    input{
        width: inherit;
    }
    label{
        width: -webkit-fill-available;
    }
</style>

<label style={`margin: ${margin}; ${styles}`}>{title}
    <input class="primaryInput"
        bind:this={inputElm}
        on:input={handleInputChange}
        value={startingValue}
        {placeholder}
    />
</label>
