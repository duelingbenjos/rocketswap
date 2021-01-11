<script>
    import { getContext } from 'svelte'
    
    //Icons
    import LightMode from './lightmode.svelte'
    import DarkMode from './darkmode.svelte'
    
    const { currentThemeName, themeToggle } = getContext('app')
</script>

<style>
    .container {
        position: relative;
    }
    .icons{
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        cursor: pointer;
        transition: 1s opacity;
    }
    .container:hover > .back{
        opacity: 1;
    }
    .container:hover > .front{
        opacity: 0;
    }
    .front{
        opacity: 1;
    }
    .back{
        opacity: 0;
    }

</style>

<div class="wrapper">
    <div class="container">
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
</div>




