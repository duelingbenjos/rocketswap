<script>
    //Icons 
    import YieldLogo from '../../icons/yield-logo.svelte'
    import DicrectionalArrowIcon from '../../icons/directional-arrow.svelte'

    export let stakingToken
    export let yieldToken
    export let stakingContractType = ""
    export let horizontal = false
</script>

<style>
    .symbols{
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        margin-bottom: -10px;
    }
    .symbols-horizontal{
        text-shadow: 2px 2px var(--staking-pannel-header-symbols-text-shadow);
        margin-top: 0.5rem;
    }
    .header{
        position: relative;
        margin-bottom: 1rem;
    }
    .logos-symbols{
        margin-right: 20px;
    }
</style>

{#if !horizontal}
    <div class="flex-col flex-center-center header ">
        <div class="flex-row flex-center-center symbols weight-600 text-xlarge">
                    {`${stakingToken.token_symbol}${stakingContractType === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
                    <DicrectionalArrowIcon direction="right" width="10px" margin="-2px 4px 0" />
                    {yieldToken.token_symbol}
        </div>
        <YieldLogo {yieldToken} {stakingContractType} {stakingToken} />
    </div>
{:else}
    <div class="logos-symbols flex-col flex-center-center">
        <YieldLogo {yieldToken} {stakingToken} {stakingContractType} margin="0"/>
        <div class="flex-row flex-center-center symbols-horizontal weight-600 text-large">
            {`${stakingToken.token_symbol}${stakingContractType === "liquidity_mining_smart_epoch" ? " LP" : ""}`}
            <DicrectionalArrowIcon direction="right" width="10px" margin="0 4px" />
            {yieldToken.token_symbol}
        </div>
    </div>
{/if}