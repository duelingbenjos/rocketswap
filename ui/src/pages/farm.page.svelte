<script >
    import { onMount } from 'svelte'

    // Components
    import HeadMeta from '../components/head-meta.svelte'
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import HorizontalStakingPanel from '../components/panels/horizontal-staking-panel.svelte'
    import PageHeader from '../components/misc/page-header.svelte'
    import EarnFilters from '../components/misc/earn-filters.svelte'
    import OnBoarding from '../components/onboarding/onboarding-messages.svelte'

    // Services
    import { WsService } from '../services/ws.service'
    const ws = WsService.getInstance()
    import { ApiService } from '../services/api.service'
	const api = ApiService.getInstance()

    //Misc
    import { stakingInfoProcessed, earnFilters, farmFilter, farmFilterUpDown } from '../store'
    import { config } from '../config'
import { toBigNumber } from '../utils';

    let innerWidth;

    $: pageTitle = 'Rocket Farm'
    $: pageDescription = "The FASTEST way to earn Crypto!"
    $: filteredList = filterBySelection($stakingInfoProcessed, $farmFilter, $farmFilterUpDown);
    $: finalFilteredList = filterBySearch(filteredList, $earnFilters?.search);

    onMount(() => {
        ws.joinStakingPanel()
        return () => ws.leaveStakingPanel()
    })

    const filterBySelection = (list, filterType) => {
        let up = -1
        let down = 1

        if ($farmFilterUpDown === "down") {
            up = 1
            down = -1
        }
        if (filterType === "alpha_reward_token") list.sort((a, b) => {
            let token_a_name = a.yield_token ? a.yield_token.token_name : ""
            let token_b_name = b.yield_token ? b.yield_token.token_name : ""
            return token_a_name > token_b_name ? up : down
        })
        if (filterType === "alpha_staking_token") list.sort((a, b) => {
            let token_a_name = a.staking_token ? a.staking_token.token_name : ""
            let token_b_name = b.staking_token ? b.staking_token.token_name : ""
            return token_a_name > token_b_name ? up : down
        })
        if (filterType === "apy") list.sort((a, b) => {
            if (!a.ROI_yearly) a.ROI_yearly = toBigNumber(0)
            if (!b.ROI_yearly) b.ROI_yearly = toBigNumber(0)
            return a.ROI_yearly.isGreaterThan(b.ROI_yearly) ? up : down
        })
        if (filterType === "start_time") list.sort((a, b) => {
            return new Date(a.StartTime.__Time__) > new Date(b.StartTime.__Time__) ? up : down
        })
        if (filterType === "end_time") list.sort((a, b) => {
            return new Date(a.EndTime.__Time__) > new Date(b.EndTime.__Time__) ? up : down
        })/*
        if (filterType === "total_value_of_staked") list.sort((a, b) => {
            if (!a.StakedBalance) a.StakedBalance = toBigNumber(0)
            if (!b.StakedBalance) b.StakedBalance = toBigNumber(0)
            else return a.StakedBalance.isGreaterThan(b.StakedBalance) ? up : down
        })*/
        return list
    }

    const filterBySearch = (list, search) => {
        console.log({list})
        if (!search) return list
        let filteredList = []
        list.forEach(item => {
            let pass = false
            let contractName_lower = item.contract_name.toLowerCase()
            let stakingTokenSymbol_lower = item.staking_token ? item.staking_token.token_symbol.toLowerCase() : ""
            let stakingTokenName_lower = item.staking_token ? item.staking_token.token_name.toLowerCase() : ""
            let stakingTokenContractName_lower = item.staking_token ? item.staking_token.contract_name.toLowerCase() : ""
            let yieldTokenSymbol_lower = item.yield_token ? item.yield_token.token_symbol.toLowerCase() : ""
            let yieldTokenName_lower = item.yield_token ? item.yield_token.token_name.toLowerCase() : ""
            let yieldTokenContractName_lower = item.yield_token ? item.yield_token.contract_name.toLowerCase() : ""
            if (
                contractName_lower.includes(search) ||
                stakingTokenSymbol_lower.includes(search) ||
                stakingTokenName_lower.includes(search) ||
                stakingTokenContractName_lower.includes(search) ||
                yieldTokenSymbol_lower.includes(search) ||
                yieldTokenName_lower.includes(search) ||
                yieldTokenContractName_lower.includes(search) 
            ) {
                filteredList.push(item)
            }
            
        })
        return filteredList
    }
</script>

<style>
    .page{
        width: 100%;
        max-width: 1020px;
        margin-bottom: 10rem;
        padding: 0 20px 20px;
        margin: 0 auto;
        box-sizing: border-box;
    }
    .panels{
        flex-direction: column;
        box-sizing: border-box;
        flex-wrap: wrap;
    }

    .horizontal{
        flex-wrap: nowrap;
    }

    .earn-content{
        margin-top: 1rem;
        margin-bottom: 4rem;
        box-sizing: border-box;
    }

    @media screen and (min-width: 430px) {
        .page{
            padding: 0 20px 20px;
        }

    }

    @media screen and (min-width: 650px) {
        .panels{
            flex-direction: row;
            justify-content: space-evenly;
        }
    }

    @media screen and (min-width: 800px) {
        .horizontal{
            flex-direction: column;
            align-items: unset;
            justify-content: unset;
        }
    }

</style>


<HeadMeta {pageTitle} {pageDescription} />

<div class="page">
    <PageHeader title={pageTitle} />
    <EarnFilters />
    <OnBoarding type="rocketfarm_info" />
    <div class="flex earn-content panels" 
        class:horizontal={$earnFilters?.rowView}>
        {#each finalFilteredList as stakeInfo (stakeInfo.contract_name)}
            <StakingPanel stakingInfo={stakeInfo} horizontal={$earnFilters?.rowView && innerWidth > 800}/>
        {/each}
    </div>
</div>

<svelte:window bind:innerWidth />