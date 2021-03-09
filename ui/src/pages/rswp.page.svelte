<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { writable } from 'svelte/store'

    // Components
    import RSWPBalance from '../components/rswp/rswp-balance.svelte'
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import RSWPDiscountPanel from '../components/panels/rswp-discount-panel.svelte'
    import RSWPFarming from '../components/rswp/rswp-farming.svelte'

    // Services
    import { WsService } from '../services/ws.service'
    const ws = WsService.getInstance()
    import { ApiService } from '../services/api.service'
	const api = ApiService.getInstance()

    //Misc
    import { rswpStakingInfo } from '../store'
    import { config } from '../config'

    let rswpToken = writable()

    $: pageTitle = 'RocketSwap Token'

    setContext("rswpContext", {
        rswpToken
    })


    onMount(() => {
        ws.joinStakingPanel()
        getRSWPTokenInfo()
        return () => ws.leaveStakingPanel()
    })
    rswpToken.subscribe(r => console.log(r))
    const getRSWPTokenInfo = async () => rswpToken.set(await api.getToken(config.ammTokenContract).then(res => res.token))

</script>

<style>
    .page{
        width: 100%;
        max-width: 1020px;
        margin-bottom: 6rem;
        margin: 0 auto;
    }

    .panels{
        flex-direction: column;
    }

    @media screen and (min-width: 430px) {
        .page{
            padding: 20px;
        }
    }

    @media screen and (min-width: 650px) {
        .panels{
            flex-direction: row;
        }
    }
</style>


<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div class="page">
    <RSWPBalance />
    <div class="flex panels">
        <StakingPanel stakingInfo={$rswpStakingInfo}/>
        <RSWPDiscountPanel />
    </div>
</div>
