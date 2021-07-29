<script>
    import { fade } from 'svelte/transition';

    // Misc
    import { onboarding_settings } from '../../store.ts'
    import { setOnboardingSetting } from '../../utils.ts'

    // Icons
    import CloseCircle from '../../icons/close-circle.svelte'

    export let type

    const onboarding_paragraphs = {
        home_info: {
            paragragh_list: [
                {
                    style: "regular",
                    text: "Rocketswap",
                    bold: true
                },
                {
                    style: "regular",
                    text: " is a community developed Automated Market Maker for exchanging digital assets. "
                },
                {
                    style: "link",
                    text: "Learn More about Rocketswap.",
                    href: "https://rocketswap.exchange/#/help/"
                }
            ],
            hasBackground: true,
            fontSize: "18px",
            maxWidth: "850px"            
        },
        rocketfarm_info: {
            paragragh_list: [
                {
                    style: "regular",
                    text: "Yield farming ",
                    bold: true
                },
                {
                    style: "regular",
                    text: " is a way to make more crypto with your crypto. It involves you staking your funds to others through the magic of computer programs called smart contracts. In return for your service, you earn rewards in the form of crypto. "
                },
                {
                    style: "link",
                    text: "Learn more about farming and staking.",
                    href: "https://rocketswap.exchange/docs/#/guides"
                }
            ],
            hasBackground: true,
            maxWidth: "850px"            
        }
    }
</script>

<style>
    .container{
        box-sizing: border-box;
        color: var(--text-primary-color);
        font-size: var(--text-size-small);

        padding: 15px 15px 15px 25px;

        width: 100%;
        margin: 1rem auto;
    }
    .bold{
        font-weight: bold;
    }
    .has-background{
        border-radius: 0;
        background-color: var(--msg-box-background);
        box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    }
    .close-icon{
        margin-left: 10px;
    }
    a:visited{
        color: var(--text-color-highlight);
    }
    @media screen and (min-width: 430px) {
        .container{
            border-radius: var(--border-radius);
        }
    }

</style>

{#if $onboarding_settings[type]}
    <div 
        class="container flex-row" 
        class:has-background={onboarding_paragraphs[type].hasBackground}
        style={`max-width: ${onboarding_paragraphs[type].maxWidth}; font-size: ${onboarding_paragraphs[type].fontSize}`} 
        out:fade="{{delay: 0, duration: 300}}">
        <div class="flex-grow">
            {#each onboarding_paragraphs[type].paragragh_list as paragragh }
            {#if paragragh.style === "regular"}
                <span class:bold={paragragh.bold}>{paragragh.text}</span>
            {/if}
            {#if paragragh.style === "link"}
                <br>
                <a href="{paragragh.href}" class="text-color-highlight" rel="noopener noreferrer" target="_blank">{paragragh.text}</a>
            {/if}
            {/each}
        </div>
    <CloseCircle click={() => setOnboardingSetting(type, false)} margin="0 0 0 10px" color="var(--text-color-highlight)"/>
    </div>
{/if}

