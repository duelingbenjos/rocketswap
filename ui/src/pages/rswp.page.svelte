<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { writable } from 'svelte/store'

    // Components
    import RSWPBalance from '../components/rswp/rswp-balance.svelte'
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import RSWPDiscountPanel from '../components/panels/rswp-discount-panel.svelte'
    import RSWPFarming from '../components/rswp/rswp-farming.svelte'
    import SmallBoxedMessage from '../components/misc/small-boxed-message.svelte'

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
        margin: 0 auto;
        padding-bottom: 2rem;
        box-sizing: border-box;
    }

    .panels{
        flex-direction: column;
        box-sizing: border-box;
        align-items: center;
    }

    a, a:visited{
        color: var(--color-primary);
    }
    a:hover{
        color: var(--color-secondary);
    }
    ul{
        list-style: none;
        padding: 0;
    }
    li{
        list-style-position: outside;
        background:url('/assets/images/rocketswap_icon.svg') no-repeat 0px 0px;
        padding-left: 25px;
    }

    @media screen and (min-width: 430px) {
        .page{
            padding: 20px 20px 4rem 20px;
        }
    }

    @media screen and (min-width: 650px) {
        .panels{
            flex-direction: row;
            justify-content: space-around;
        }
    }
</style>


<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div class="page">
    <RSWPBalance />
    <div class="flex-row flex-justify-spacearound">
        <SmallBoxedMessage title="What does my RSWP token do?" >
            <ul slot="message" class="text-xsmall">
                <li>Stake {config.currencySymbol} below to earn RSWP over time.</li>
                <li>Buy RWSP from the RSWP/{config.currencySymbol} pairing. 
                    <a href="{`/#/${config.ammTokenContract}`}" class="weight-600">Buy Now!</a>
                </li>
            </ul>
        </SmallBoxedMessage>
        <SmallBoxedMessage title="How do I get RSWP?" >
            <ul slot="message" class="text-xsmall">
                <li>Instant 30% discount on fees when paying in RSWP.</li>
                <li>Additional discount on fees depending on how much RSWP is in your Fuel Tank</li>
            </ul>
        </SmallBoxedMessage>
    </div>

    <div class="flex panels">
        <StakingPanel stakingInfo={$rswpStakingInfo}/>
        <RSWPDiscountPanel />
    </div>
</div>
