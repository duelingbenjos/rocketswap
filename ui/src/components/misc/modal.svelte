<script>
    import { setContext, beforeUpdate } from 'svelte'

    // Misc
    import { mainMenuOpen } from '../../store'
    
    export let open;
    export let toggleModal;
    export let zIndex = 90;

    setContext('modal_functions', {
		toggleModal
    });

    beforeUpdate(() => {
        if (open) mainMenuOpen.set(false)
    })

    const slots = ["main", "main-centered"]

    let modalElm

    const closeModal = (e) => {
        if (slots.includes(e.target?.attributes?.slot?.value)) toggleModal();
        else{ 
            e.target.classList.forEach(className => className === "modal" ? toggleModal() : null)
        }
        return true;
    }
</script>

{#if open}
    <div bind:this={modalElm} class="modal" on:click={closeModal} style={`z-index: ${zIndex};`}>
        <slot name="main"></slot>
        <slot name="main-centered"></slot>
    </div>
{/if}

