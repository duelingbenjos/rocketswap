<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { writable } from 'svelte/store'

    // Components
    import RSWPBalance from '../components/rswp/rswp-balance.svelte'
    import StakingPanel from '../components/panels/staking-panel.svelte'
    import RSWPDiscountPanel from '../components/panels/rswp-discount-panel.svelte'
    import RSWPFarming from '../components/rswp/rswp-farming.svelte'
    import SmallBoxedMessage from '../components/misc/small-boxed-message.svelte'

    // Icons
    import RocketswapLogoIcon from '../icons/rocketswap-logo.svelte'

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

    const getRSWPTokenInfo = async () => rswpToken.set(await api.getToken(config.ammTokenContract).then(res => res.token))

    const gotoBuyRSWP = () => location.assign(`/#/${config.ammTokenContract}`)

</script>

<style>
    .page{
        width: 100%;
        max-width: 1020px;
        margin: 0 auto;
        padding-bottom: 10rem;
        box-sizing: border-box;
    }

    .panels{
        flex-direction: column;
        box-sizing: border-box;
        align-items: center;
    }

    .li{
        margin: 0.25rem 0;
    }
    .buy-button{
        margin: 1rem auto 0;
    }

    @media screen and (min-width: 430px) {
        .page{
            padding: 0 20px 6rem 20px;
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

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{pageTitle}" />
	<meta name="twitter:description" content="{`Learn about the ${config.ammTokenSymbol} token!`}" />
	<meta name="twitter:site" content="@RSwapOfficial" />
	<meta name="twitter:creator" content="Lamden Community" />
	<meta name="twitter:image" content="/assets/images/RS_Logo_192.png" />
	<meta name="twitter:image:alt" content="/assets/images/RS_Logo_192.png" />

	<meta property="og:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{pageTitle}" />
	<meta property="og:image" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:description" content="{`Learn about the ${config.ammTokenSymbol} token!`}" />
	<meta property="og:image:url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:secure_url" content="/assets/images/RS_Logo_192.png" />
	<meta property="og:image:width" content="192" />
	<meta property="og:image:height" content="192" />
	<meta property="og:image:type" content="image/png" />
</svelte:head>

<div class="page">
    <RSWPBalance />
    <div class="flex-row flex-justify-spacearound">
        <SmallBoxedMessage title="How do I get RSWP?"  >
            <div slot="message" class="flex-col text-xsmall">
                <div class="li flex-row">
                    <RocketswapLogoIcon 
                        width="20px" 
                        margin="0 10px 0 0" 
                        color="var(--text-primary-color)" 
                        styles="min-width: 20px;"
                    /> 
                    <span>
                        {config.currencySymbol} below to earn RSWP over time.
                    </span>
                </div>

                <div class="li flex-row">
                    <RocketswapLogoIcon 
                        width="20px" 
                        margin="0 10px 0 0" 
                        color="var(--text-primary-color)"
                        styles="min-width: 20px;"  
                    /> 
                    <span>
                        Buy RWSP from the RSWP/{config.currencySymbol} pairing.
                    </span>
                </div>
                <button class="primary buy-button" on:click={gotoBuyRSWP}>Buy {config.ammTokenSymbol}!</button>
            </div>
            
        </SmallBoxedMessage>
        <SmallBoxedMessage title="What does my RSWP token do?">
            <div slot="message" class="flex-col text-xsmall">
                <div class="li flex-row">
                    <RocketswapLogoIcon 
                        width="20px" 
                        margin="0 10px 0 0" 
                        color="var(--text-primary-color)"
                        styles="min-width: 20px;" 
                    /> 
                    <span>
                        Instant 30% discount on fees when paying in RSWP.
                    </span>
                </div>

                <div class="li flex-row">
                    <RocketswapLogoIcon 
                        width="20px" 
                        margin="0 10px 0 0" 
                        color="var(--text-primary-color)" 
                        styles="min-width: 20px;" 
                    /> 
                    <span>
                        Additional discount on fees depending on how much RSWP is in your Fuel Tank
                    </span>
                </div>
            </div>
        </SmallBoxedMessage>
    </div>

    <div class="flex panels">
        <StakingPanel stakingInfo={$rswpStakingInfo}/>
        <RSWPDiscountPanel />
    </div>
</div>
