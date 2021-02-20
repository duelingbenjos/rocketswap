<script>
    export let margin = 0;
    // Components
    import LightingBoltIcon from './lighting-bolt.svelte'
    import LamdenLogoIcon from './lamden-logo.svelte'

    //Misc
    import { openNewTab } from './utils'

</script>

<style>
    .wrapper{
        opacity: 0.5;
        cursor: pointer;
    }
    .powered-by-lamden-logo{
        position: relative;
    }
    .wrapper:hover{
        opacity: 1;
    }
    .background-icon{
        position: absolute;
        top: 0px;
        margin-left: 10px;
    }
</style>
<div style={`margin: ${margin}; display: flex; justify-items: center; align-content:center; cursor: pointer`} on:click={() => openNewTab('https://www.lamden.io') }>
    <span class="text-primary text-xsmall weight-400">Powered by Lamden</span>
    <div class="powered-by-lamden-logo">
        <div class="background-icon">
            <LamdenLogoIcon width="20px" margin="0 0 0 -5px;" reverseColors={false}/>
        </div>
        <div class="background-icon">
            <LightingBoltIcon width="10px" margin="2px 0 0 0 " color="white"/>
        </div>
    </div>
</div>
