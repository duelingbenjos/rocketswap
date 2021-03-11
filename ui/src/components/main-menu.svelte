<script>
    // Components
    import Socials from './misc/socials.svelte'

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
        right: 0;
        width: 100vw;
        height: 100vh;


        background: var(--color-secondary);
        z-index: 109;
        padding-top: 2rem;
        background: var(--color-secondary);
        background: linear-gradient(222deg, #9100ff 0%, #3a00a7d1 100%);

        box-shadow: -1px 10px 11px 0px rgba(0, 0, 0, 0.5);
	    -webkit-box-shadow: -1px 10px 11px 0px rgba(0, 0, 0, 0.5);
	    -moz-box-shadow: -1px 10px 11px 0px rgba(0, 0, 0, 0.5);
    }
    .show{
        display: block;
    }
    .light-dark-button{
        display: none;
    }
    /* When page width is greater than 320px */
    @media screen and (min-width: 320px) {
        .light-dark-button{
			display: block;
		}
    }

    /* When page width is greater than 430px */
    @media screen and (min-width: 430px) {
        .menu{
            border-radius: 0 0 0 32px;
            max-width: 320px;
            max-height: 600px;
        }
    }

    /* When page width is greater than 730px (tablets) */
    @media screen and (min-width: 730px) {
		.main-menu{
            display: none;
        }
    }
</style>

<div class="main-menu flex-row flex-align-center">
    <div class="flex-col menu" class:show={$mainMenuOpen}>
        <slot name="links"> </slot>
    </div>
    <div class="light-dark-button">
        <LightDark />
    </div>
    <MenuButtonIcon width="40px" margin="0 0 0 16px"/>
</div>