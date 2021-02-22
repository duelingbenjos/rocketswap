<script>
    // Icons
    import MenuButtonIcon from '../icons/menu-button.svelte'
    import LightDark from '../icons/light-dark.svelte'

    // Misc
	import { mainMenuOpen } from '../store'
</script>

<style>
    .menu{
        display: none;
        align-items: center;
        box-sizing: border-box;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--color-secondary);
        z-index: 109;
        padding-top: 5rem;
        background: var(--color-secondary);
        background: linear-gradient(125deg, #9100ff 0%, #3a00a7d1 100%);
    }
    .show{
        display: block;
    }

    @media screen and (min-width: 650px) {
        .main-menu{
            display: none;
        }
	}
</style>

<div class="main-menu flex-row flex-align-center">
    <div class="menu" class:show={$mainMenuOpen}>
        <slot name="links"> </slot>
        
    </div>
    <LightDark />
    <MenuButtonIcon width="40px" margin="0 0 0 16px"/>
    
</div>