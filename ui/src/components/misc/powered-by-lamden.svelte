<script>
    export let margin = 0;
    // Components
    import LightingBoltIcon from '../../icons/lighting-bolt.svelte'
    import LamdenLogoIcon from '../../icons/lamden-logo.svelte'

    //Misc
    import { openNewTab } from '../../utils'

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
<div class="wrapper flex-row flex-center-center" style={`margin: ${margin};`} on:click={() => openNewTab('https://www.lamden.io') }>
    <span class="text-primary text-xsmall weight-400">Powered by Lamden</span>
    <div class="powered-by-lamden-logo">
        <div class="background-icon">
            <LamdenLogoIcon width="20px" margin="0 0 0 -5px;" reverseColors={true}/>
        </div>
        <div class="background-icon">
            <LightingBoltIcon width="10px" margin="2px 0 0 0 " color="var(--color-secondary)"/>
        </div>
    </div>
</div>
