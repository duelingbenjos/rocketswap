<script lang="ts">
    import { onMount } from 'svelte'

    // Components
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import HorizontalStakingPanel from '../components/panels/horizontal-staking-panel.svelte'
    import PageHeader from '../components/misc/page-header.svelte'
    import EarnFilters from '../components/misc/earn-filters.svelte'

    // Services
    import { WsService } from '../services/ws.service'
    const ws = WsService.getInstance()
    import { ApiService } from '../services/api.service'
	const api = ApiService.getInstance()

    //Misc
    import { stakingInfoProcessed, earnFilters } from '../store'
    import { config } from '../config'

    let innerWidth;

    $: pageTitle = 'Rocket Farm'
    $: filteredList = filterList($stakingInfoProcessed, $earnFilters?.search);

    onMount(() => {
        ws.joinStakingPanel()
        return () => ws.leaveStakingPanel()
    })

    const filterList = (list, search) => {
        if (!search) return list
        let filteredList = []
        list.map(item => {
            let pass = false
            let contractName_lower = item.contract_name.toLowerCase()
            let stakingTokenSymbol_lower = item.staking_token.token_symbol.toLowerCase()
            let stakingTokenName_lower = item.staking_token.token_name.toLowerCase()
            let stakingTokenContractName_lower = item.staking_token.contract_name.toLowerCase()
            let yieldTokenSymbol_lower = item.yield_token.token_symbol.toLowerCase()
            let yieldTokenName_lower = item.yield_token.token_name.toLowerCase()
            let yieldTokenContractName_lower = item.yield_token.contract_name.toLowerCase()
            if (
                contractName_lower.includes(search) ||
                stakingTokenSymbol_lower.includes(search) ||
                stakingTokenName_lower.includes(search) ||
                stakingTokenContractName_lower.includes(search) ||
                yieldTokenSymbol_lower.includes(search) ||
                yieldTokenName_lower.includes(search) ||
                yieldTokenContractName_lower.includes(search) 
            ) filteredList.push(item)

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
        align-items: center;
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
            align-items: center;
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


<svelte:head>
	<title>{pageTitle}</title>

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{pageTitle}" />
	<meta name="twitter:description" content="The FASTEST way to Earn cypto!" />
	<meta name="twitter:site" content="@RSwapOfficial" />
	<meta name="twitter:creator" content="Lamden Community" />
	<meta name="twitter:image" content="/assets/images/RS_Logo_192.png" />
	<meta name="twitter:image:alt" content="/assets/images/RS_Logo_192.png" />

	<meta property="og:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{pageTitle}" />
	<meta property="og:image" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:description" content="The FASTEST way to Earn cypto!" />
	<meta property="og:image:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:secure_url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:width" content="192" />
	<meta property="og:image:height" content="192" />
	<meta property="og:image:type" content="image/png" />
</svelte:head>

<div class="page">
    <PageHeader title={pageTitle} />
    <EarnFilters />
    <div class="flex earn-content panels" 
        class:horizontal={$earnFilters?.rowView}>
        {#each filteredList as stakeInfo}
            <StakingPanel stakingInfo={stakeInfo} horizontal={$earnFilters?.rowView && innerWidth > 800}/>
        {/each}
    </div>
</div>

<svelte:window bind:innerWidth />