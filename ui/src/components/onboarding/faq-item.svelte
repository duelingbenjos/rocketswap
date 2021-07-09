<script>
    import { fade } from 'svelte/transition';

    // Icons
    import PlusCircle from '../../icons/plus-circle.svelte'
    import MinusCircle from '../../icons/minus-circle.svelte'

    export let faqItem

    let showAnswer = false

    function toggleAnswer(){
        if (!showAnswer) showAnswer = true
        else showAnswer = false
    }

</script>

<style>
    .container{
        background: var(--faq-item-background);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
    }
    p{
        margin: 0;
        width: 100%;
    }
    button{
        width: 24px;
        height: 24px;
    }
    .answer{
        margin-top: 0.5rem;
    }

    @media screen and (min-width: 2560px) {
        .container{
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 14px;
            font-size: var(--text-size-xxlarge);
        }
        .answer{
            margin-top: 1rem;
        }
        button{
            width: 40px;
            height: 40px;
        }
	}
</style>

<div class="container flex-col text-small">
    <div class="flex-row flex-align-center">
        <p>{faqItem.q}</p>
        <button on:click={toggleAnswer}>
            {#if showAnswer}
                <MinusCircle width="100%" />
            {:else}
                <PlusCircle width="100%" />
            {/if}
        </button>
    </div>

    {#if showAnswer}
        <div in:fade="{{delay: 0, duration: 500}}">
            <p class="text-primary-dim answer">{faqItem.a}</p>
        </div>
    {/if}
</div>