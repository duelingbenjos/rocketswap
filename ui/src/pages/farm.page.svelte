<script >
    import { onMount } from 'svelte'

    // Components
    import HeadMeta from '../components/head-meta.svelte'
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import PageHeader from '../components/misc/page-header.svelte'
    import EarnFilters from '../components/misc/earn-filters.svelte'
    import OnBoarding from '../components/onboarding/onboarding-messages.svelte'

    // Services
    import { WsService } from '../services/ws.service'
    const ws = WsService.getInstance()
    import { ApiService } from '../services/api.service'
    const api = ApiService.getInstance()

    //Misc
    import { stakingInfoProcessed, earnFilters, farmFilter, farmFilterUpDown, farmStakedByMe, userYieldInfo, farmShowClosed } from '../store'
    import { toBigNumber } from '../utils';

    let innerWidth;

    $: pageTitle = 'Rocket Farm'
    $: pageDescription = "The FASTEST way to earn Crypto!"
    $: results = processList($stakingInfoProcessed, $earnFilters?.search, $farmFilter, $farmFilterUpDown, $farmStakedByMe, $userYieldInfo, $farmShowClosed);

    onMount(() => {
        ws.joinStakingPanel()
        return () => ws.leaveStakingPanel()
    })

    const processList = (list, search, sortType) => {
        list = runFilters(list, search)
        list = runSorts(list, sortType)
        // console.log("start")
        // console.log(list.map(l => l.StartTime.__time__))
        // console.log("end")
        // console.log(list.map(l => l.EndTime.__time__))
        return list
    }

    const runFilters = (list, search) => {
        if ($farmStakedByMe && $userYieldInfo) {
            list = list.filter(farm => {
                let yeildInfo = $userYieldInfo[farm.contract_name]
                if (!yeildInfo) return false
                if (!yeildInfo.total_staked) return false
                return yeildInfo.total_staked.isGreaterThan(0)
            })
        }

        if (!$farmShowClosed){
            list = list.filter(farm => farm.OpenForBusiness === true)
        }

        if (!search) return list
        let filteredList = []
        list.forEach(item => {
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

    const runSorts = (list, filterType) => {
        // console.log({filterType})
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
        if (filterType === "start_date") list.sort((a, b) => {
            return new Date(a.StartTime.__time__) > new Date(b.StartTime.__time__) ? up : down
        })
        if (filterType === "end_date") list.sort((a, b) => {
            return new Date(a.EndTime.__time__) > new Date(b.EndTime.__time__) ? up : down
        })

        return list
    }


</script>

<style>
    .page{
        width: 100%;
        max-width: 2500px;
        margin-bottom: 10rem;
        padding: 0 20px 20px 20px;
        margin: 0 auto;
        box-sizing: border-box;
    }
    .panels{
        flex-direction: column;
        box-sizing: border-box;
        flex-wrap: wrap;
    }

    .earn-content{
        margin-top: 1rem;
        margin-bottom: 4rem;
        box-sizing: border-box;
        align-items: center;
    }

    p{
        margin: 0 auto;
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

    @media screen and (min-width: 1020px) {
		.page {
			max-width: 1020px;
		}
	}
	@media screen and (min-width: 1330px) {
		.page {
			max-width: 1330px;
		}
	}
	@media screen and (min-width: 1960px) {
		.page {
			max-width: 1960px;
		}
	}





</style>


<HeadMeta {pageTitle} {pageDescription} />

<div class="page">
    <PageHeader title={pageTitle} />
    <OnBoarding type="rocketfarm_info" />
    <EarnFilters />
    <div class="flex earn-content panels" >
        {#each results as stakeInfo (stakeInfo.contract_name)}
            <StakingPanel stakingInfo={stakeInfo}/>
        {/each}
        {#if results.length === 0 && $farmStakedByMe}
            <p class="text-xlarge text-color-highlight">You have no tokens staked</p>
        {/if}
    </div>
</div>

<svelte:window bind:innerWidth />