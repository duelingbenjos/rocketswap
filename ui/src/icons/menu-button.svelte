<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Misc
	import { mainMenuOpen } from '../store'
    
    export let width = "40px";
    export let color = "var(--text-primary-color)";
    export let margin = "0";

    const handleClick = () => {
        if ($mainMenuOpen) mainMenuOpen.set(false)
        else mainMenuOpen.set(true)
    }
</script>

<style>
    .open{
        position:relative;
        z-index: 110;
    }

</style>

<div class="flex align-center-center" class:open={$mainMenuOpen} style={`margin: ${margin};`} on:click={handleClick}>
    {#if $mainMenuOpen}
        <!-- Filled -->
        <svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
            <path fill="var(--color-primary)" d="M20 14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14Z" undefined="1"></path>
            <path fill="var(--color-primary)" d="M21.5 8H2.5C2.5 5.79 4.29 4 6.5 4H17.5C19.71 4 21.5 5.79 21.5 8Z" undefined="1"></path>
            <path fill="var(--color-primary)" d="M2.5 16H21.5C21.5 18.21 19.71 20 17.5 20H6.5C4.29 20 2.5 18.21 2.5 16Z" undefined="1"></path>
        </svg>
    {:else}
        <!-- Outlined -->
        <svg {width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke={color} fill="none" d="M20 14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14Z"></path>
            <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke={color} fill="none" d="M21.5 7H2.5C2.5 4.79 4.29 3 6.5 3H17.5C19.71 3 21.5 4.79 21.5 7Z"></path>
            <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke={color} fill="none" d="M2.5 17H21.5C21.5 19.21 19.71 21 17.5 21H6.5C4.29 21 2.5 19.21 2.5 17Z"></path>
        </svg>
    {/if}
</div>
