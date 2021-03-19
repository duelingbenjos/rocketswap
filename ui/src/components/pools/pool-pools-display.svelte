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
        margin-bottom: 4rem;
    }
</style>
<div class="flex-row flex-justify-spaceevenly">
    {#if $lpPairs?.length > 0}
            {#each $lpPairs as pairInfo}
                {#if $lpBalances[pairInfo.contract_name].isGreaterThan(2)}
                    <PoolPanel {pairInfo} />
                {/if}
            {/each}
    {:else}
        {#if $walletIsReady}
            <p>No liquidity found.</p>
        {:else}
            <p>Wallet is not Connected.</p>
        {/if}
    {/if}
</div>

