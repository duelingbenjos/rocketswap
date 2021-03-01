<script>
    import { getContext } from 'svelte'
    
    //Icons
    import LightMode from './lightmode.svelte'
    import DarkMode from './darkmode.svelte'

    export let margin = "0";
    
    const { currentThemeName, themeToggle } = getContext('app')
</script>

<style>
    .wrapper{
        position: relative;

        display: flex;
        justify-content: center;
        align-items: center;

        width: 28px;
        height: 28px;
        border: 1px solid var(--color-primary-dark);
        border-radius: 99px;
        padding: 2px;

        box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -1px 2px 4px 0px rgba(0, 0, 0, 0.5);

    }
    .wrapper:hover{
        top: 1px;
        background: var(--text-primary-color-dimmer);
        border: 1px solid var(--color-primary);
        box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.5);
    }
    .wrapper:active{
        top: 2px;
        box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
    }
    .icons{
        position: absolute;
        width: 75%;
        height: 75%;
        cursor: pointer;
        transition: 0.5s opacity;
        opacity: 0;
        
    }
    .wrapper:hover > .back{
        opacity: 1;
    }
    .wrapper:hover > .front{
        opacity: 0;
    }
    .front{
        opacity: 1;
    }
    .back{
        opacity: 0;
    }

</style>

<div class="wrapper" style={`margin: ${margin};`}>
    <div class="icons" 
            class:back={$currentThemeName === "dark"} 
            class:front={$currentThemeName === "light"} 
            on:click={themeToggle}>
        <LightMode />
    </div>

    <div class="icons" 
            class:back={$currentThemeName === "light"}
            class:front={$currentThemeName === "dark"}
            on:click={themeToggle}>
        <DarkMode />
    </div>
</div>




