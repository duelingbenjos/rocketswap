<script>
    //Components
    import PoolPanel from '../panels/pool-info-panel.svelte'

    //Misc
    import { walletAddress, walletIsReady, lpPairs, lpBalances } from '../../store'
    import { stringToFixed, quoteCalculator, toBigNumber } from '../../utils'
    import { config } from '../../config'

</script>

<style>
    div{
        box-sizing: border-box;
        flex-wrap: wrap;
        padding-bottom: 10rem;
    }
</style>
<div class="flex-row flex-justify-spaceevenly">
    {#if $lpPairs?.length > 0}
            {#each $lpPairs as pairInfo}
                <PoolPanel {pairInfo} />
            {/each}
    {:else}
        {#if $walletIsReady}
            <p>No liquidity found.</p>
        {:else}
            <p>Wallet is Not Connected.</p>
        {/if}
    {/if}
</div>

